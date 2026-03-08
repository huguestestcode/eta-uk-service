'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRAVELER_OPTIONS = [1, 2, 3, 4, 5, 6]

export default function FunnelPage() {
  const router = useRouter()
  const [numTravelers, setNumTravelers] = useState(1)
  const [email, setEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = numTravelers * 39

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }
    if (email !== emailConfirm) {
      setError('Les deux adresses email ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, numTravelers }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      // Redirection vers Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex flex-col">
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-extrabold text-navy-900">ETA</span>
          <span className="text-xl font-extrabold text-gold-500">·UK</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Paiement sécurisé
        </div>
      </header>

      {/* Indicateur d'étapes */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-navy-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">1</div>
              Votre commande
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">2</div>
              Paiement
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</div>
              Identités
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900">
              Votre demande ETA UK
            </h1>
            <p className="text-gray-500 mt-2">
              Commencez par nous indiquer le nombre de voyageurs et votre email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de voyageurs */}
            <div className="card">
              <h2 className="font-bold text-navy-900 text-lg mb-1">
                Nombre de voyageurs
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Vous + vos accompagnants. Chaque ETA est individuelle et liée à un passeport.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TRAVELER_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumTravelers(n)}
                    className={`py-3 rounded-xl font-bold text-lg transition-all border-2 ${
                      numTravelers === n
                        ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-navy-300 hover:bg-navy-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {numTravelers > 0 && (
                <div className="mt-4 p-3 bg-navy-50 rounded-xl flex items-center justify-between">
                  <span className="text-navy-700 font-medium text-sm">
                    {numTravelers} voyageur{numTravelers > 1 ? 's' : ''} × 39€
                  </span>
                  <span className="font-extrabold text-navy-900 text-lg">{total}€ TTC</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="card space-y-4">
              <h2 className="font-bold text-navy-900 text-lg">
                Votre adresse email
              </h2>
              <p className="text-gray-500 text-sm -mt-2">
                Nous vous enverrons la confirmation de commande et les résultats ETA à cette adresse.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.fr"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="emailConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmez l'email
                </label>
                <input
                  id="emailConfirm"
                  type="email"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  placeholder="vous@example.fr"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors"
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-navy-900 text-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Récapitulatif</span>
              </div>
              <div className="space-y-2 text-sm text-white/80 mb-4">
                <div className="flex justify-between">
                  <span>ETA UK × {numTravelers} personne{numTravelers > 1 ? 's' : ''}</span>
                  <span>{total}€</span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>dont frais gouvernementaux UK inclus</span>
                  <span>{numTravelers * 10}£ (~{Math.round(numTravelers * 11.5)}€)</span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-lg border-t border-white/20 pt-3">
                <span>Total</span>
                <span>{total}€ TTC</span>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <a href="/cgv" className="underline">CGV</a> et notre{' '}
              <a href="/confidentialite" className="underline">politique de confidentialité</a>.
              ETA·UK est un service privé indépendant du gouvernement britannique.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl text-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement…
                </>
              ) : (
                <>
                  Payer {total}€ – Étape suivante
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Garanties */}
            <div className="flex justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL sécurisé
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Remboursé si refus
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                Stripe
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
