import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getOrderBySessionId, updateOrderStatus, initTravelers } from '@/lib/db'
import { sendPaymentConfirmation } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const order = await getOrderBySessionId(session.id)
    if (!order) {
      console.error('[webhook] Commande introuvable pour session:', session.id)
      return NextResponse.json({ received: true })
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ received: true })
    }

    await updateOrderStatus(order.id, 'paid', {
      amount_paid: session.amount_total ?? 0,
      stripe_payment_intent: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : undefined,
    })

    await initTravelers(order.id, order.num_travelers)

    try {
      await sendPaymentConfirmation(order.email, order.id, order.num_travelers)
    } catch (err) {
      console.error('[webhook] Erreur email:', err)
    }
  }

  return NextResponse.json({ received: true })
}
