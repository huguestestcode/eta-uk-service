'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationInner() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') ?? ''
  const shortId = orderId.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-extrabold text-navy-900">ETA</span>
          <span className="text-xl font-extrabold text-gold-500">·UK</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Icône succès */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-navy-900 mb-3">
            Demande envoyée !
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            Merci, votre dossier est entre de bonnes mains.
          </p>

          {shortId && (
            <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-100 px-4 py-2 rounded-full text-navy-700 font-mono text-sm mb-8">
              Commande #{shortId}
            </div>
          )}

          {/* Étapes à venir */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-5 mb-8">
            <h2 className="font-bold text-navy-900 text-center">Ce qui se passe maintenant</h2>

            {[
              {
                icon: '🤖',
                title: 'Notre agent IA est au travail',
                desc: 'Il soumet actuellement vos demandes ETA auprès du Home Office britannique.',
              },
              {
                icon: '⏱️',
                title: 'Délai de traitement',
                desc: 'Le gouvernement britannique répond généralement en quelques heures. Délai maximum : 3 jours ouvrés.',
              },
              {
                icon: '📧',
                title: 'Vous serez notifié par email',
                desc: 'Dès que vos ETA sont approuvées (ou en cas de problème), vous recevrez un email détaillé.',
              },
              {
                icon: '✈️',
                title: 'Prêt à voyager',
                desc: 'L\'ETA est liée à votre passeport. Pas besoin de l\'imprimer — montrez simplement votre passeport à la frontière.',
              },
            ].map((step) => (
              <div key={step.title} className="flex gap-4">
                <div className="text-2xl flex-shrink-0">{step.icon}</div>
                <div>
                  <div className="font-semibold text-navy-900 text-sm">{step.title}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Retour à l'accueil
            </Link>
            <a
              href="mailto:contact@eta-uk.fr"
              className="block w-full border-2 border-gray-200 hover:border-navy-200 text-gray-700 font-semibold py-4 rounded-xl transition-colors"
            >
              Contacter le support
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            ETA·UK est un service privé indépendant du gouvernement britannique.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    }>
      <ConfirmationInner />
    </Suspense>
  )
}
