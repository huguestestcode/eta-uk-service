import { NextRequest, NextResponse } from 'next/server'
import { stripe, SERVICE_PRICE_CENTS } from '@/lib/stripe'
import { createOrder } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, numTravelers } = await req.json()

    // Validation basique
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }
    if (!numTravelers || numTravelers < 1 || numTravelers > 20) {
      return NextResponse.json({ error: 'Nombre de voyageurs invalide.' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const totalCents = SERVICE_PRICE_CENTS * numTravelers

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `ETA UK – ${numTravelers} voyageur${numTravelers > 1 ? 's' : ''}`,
              description:
                'Service de délégation de demande ETA UK. Frais gouvernementaux inclus (£10/personne).',
            },
            unit_amount: SERVICE_PRICE_CENTS,
          },
          quantity: numTravelers,
        },
      ],
      success_url: `${baseUrl}/funnel/identite?order_id={CHECKOUT_SESSION_ID}&n=${numTravelers}`,
      cancel_url: `${baseUrl}/funnel?cancelled=1`,
      metadata: {
        num_travelers: String(numTravelers),
        email,
      },
    })

    if (!session.id || !session.url) {
      return NextResponse.json({ error: 'Impossible de créer la session de paiement.' }, { status: 500 })
    }

    // Créer la commande en base avec le session ID (= orderId temporaire)
    createOrder(email, numTravelers, session.id)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[create-checkout]', err)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
