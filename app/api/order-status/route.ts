import { NextRequest, NextResponse } from 'next/server'
import { getOrderBySessionId, getOrder, updateOrderStatus, initTravelers } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { sendPaymentConfirmation } from '@/lib/email'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID manquant.' }, { status: 400 })
  }

  try {
    let order = (await getOrder(id)) ?? (await getOrderBySessionId(id))

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
    }

    if (order.status === 'pending_payment' && order.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)

      if (session.payment_status === 'paid') {
        await updateOrderStatus(order.id, 'paid', {
          amount_paid: session.amount_total ?? 0,
          stripe_payment_intent:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        })
        await initTravelers(order.id, order.num_travelers)

        try {
          await sendPaymentConfirmation(order.email, order.id, order.num_travelers)
        } catch {
          // Non bloquant
        }

        order = (await getOrder(order.id))!
      }
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      num_travelers: order.num_travelers,
    })
  } catch (err) {
    console.error('[order-status]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
