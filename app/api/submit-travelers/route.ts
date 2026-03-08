import { NextRequest, NextResponse } from 'next/server'
import {
  getOrderBySessionId,
  getOrder,
  getTravelersByOrder,
  updateTraveler,
  updateOrderStatus,
} from '@/lib/db'

interface TravelerInput {
  prenom: string
  nom: string
  date_naissance: string
  lieu_naissance: string
  nationalite: string
  num_passeport: string
  expiry_passeport: string
  email: string
  sexe: string
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, travelers } = await req.json() as {
      orderId: string
      travelers: TravelerInput[]
    }

    if (!orderId || !Array.isArray(travelers) || travelers.length === 0) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    // Retrouver la commande (peut être un session ID Stripe ou un UUID DB)
    const order = getOrder(orderId) ?? getOrderBySessionId(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
    }

    if (order.status === 'pending_payment') {
      return NextResponse.json(
        { error: 'Le paiement n\'a pas encore été confirmé.' },
        { status: 402 }
      )
    }

    // Valider chaque voyageur
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i]
      if (!t.prenom || !t.nom || !t.date_naissance || !t.num_passeport || !t.expiry_passeport || !t.email || !t.sexe) {
        return NextResponse.json(
          { error: `Informations incomplètes pour le voyageur ${i + 1}.` },
          { status: 400 }
        )
      }
      // Passeport non expiré
      if (new Date(t.expiry_passeport) <= new Date()) {
        return NextResponse.json(
          { error: `Le passeport du voyageur ${i + 1} est expiré.` },
          { status: 400 }
        )
      }
    }

    // Récupérer les slots voyageurs créés lors du paiement
    const slots = getTravelersByOrder(order.id)

    if (slots.length < travelers.length) {
      return NextResponse.json(
        { error: 'Nombre de voyageurs incohérent avec la commande.' },
        { status: 400 }
      )
    }

    // Enregistrer les données de chaque voyageur
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i]
      updateTraveler(slots[i].id, {
        prenom: t.prenom.trim().toUpperCase(),
        nom: t.nom.trim().toUpperCase(),
        date_naissance: t.date_naissance,
        lieu_naissance: t.lieu_naissance?.trim(),
        nationalite: t.nationalite,
        num_passeport: t.num_passeport.trim().toUpperCase().replace(/\s/g, ''),
        expiry_passeport: t.expiry_passeport,
        email: t.email.trim().toLowerCase(),
        sexe: t.sexe,
        eta_status: 'pending',
      })
    }

    updateOrderStatus(order.id, 'identity_submitted')

    // Lancer l'agent IA en arrière-plan (fire & forget)
    // On ne bloque pas la réponse HTTP
    launchAgent(order.id, order.email).catch((err) => {
      console.error('[submit-travelers] Agent error:', err)
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err) {
    console.error('[submit-travelers]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

/**
 * Lance l'agent ETA en tâche de fond.
 * Import dynamique pour éviter de charger Playwright côté client.
 */
async function launchAgent(orderId: string, email: string): Promise<void> {
  const { processOrder } = await import('@/lib/eta-agent')
  await processOrder(orderId, email)
}
