'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRAVELER_OPTIONS = [1, 2, 3, 4, 5, 6]

// Prix
const PRICE_SERVICE = 27   // € par personne
const PRICE_GOV_GBP = 10   // £ par personne
const PRICE_GOV_EUR = 12   // € équivalent
const PRICE_TOTAL = PRICE_SERVICE + PRICE_GOV_EUR // 39€

export default function FunnelPage() {
  const router = useRouter()
  const [numTravelers, setNumTravelers] = useState(1)
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [emailError, setEmailError] = useState('')

  const totalService = numTravelers * PRICE_SERVICE
  const totalGovGBP  = numTravelers * PRICE_GOV_GBP
  const totalGovEUR  = numTravelers * PRICE_GOV_EUR
  const total        = numTravelers * PRICE_TOTAL

  // Avancement de l'étape 1
  const travelersOk = numTravelers >= 1
  const emailOk     = emailConfirmed

  function confirmEmail() {
    setEmailError('')
    if (!emailInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Veuillez saisir une adresse email valide.')
      return
    }
    setEmail(emailInput)
    setEmailConfirmed(true)
  }

  function editEmail() {
    setEmailConfirmed(false)
    setEmailInput(email)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailConfirmed) {
      setEmailError('Veuillez confirmer votre email avant de continuer.')
      return
    }
    sessionStorage.setItem('eta_email', email)
    sessionStorage.setItem('eta_num_travelers', String(numTravelers))
    router.push(`/funnel/identite?n=${numTravelers}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex flex-col">
      {/* Header */}
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

      {/* Barre de progression globale — 3 étapes */}
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
              Identités
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</div>
              Paiement
            </div>
          </div>

          {/* Mini-checklist de l'étape 1 */}
          <div className="flex items-center gap-6 mt-3 text-xs">
            <span className={`flex items-center gap-1.5 font-medium ${travelersOk ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${travelersOk ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {travelersOk ? '✓' : '·'}
              </span>
              Voyageurs
            </span>
            <span className={`flex items-center gap-1.5 font-medium ${emailOk ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${emailOk ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {emailOk ? '✓' : '·'}
              </span>
              Email confirmé
            </span>
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
              Indiquez le nombre de voyageurs et votre email pour commencer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de voyageurs */}
            <div className="card">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-navy-900 text-lg">Nombre de voyageurs</h2>
                {travelersOk && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Sélectionné
                  </span>
                )}
              </div>
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

              {/* Détail des prix */}
              <div className="mt-4 rounded-xl border border-gray-100 overflow-hidden text-sm">
                <div className="px-4 py-2.5 flex justify-between bg-gray-50 text-gray-600">
                  <span>Frais de service ETA·UK × {numTravelers}</span>
                  <span>{totalService}€</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between text-gray-600 border-t border-gray-100">
                  <span>
                    Frais gouvernementaux UK × {numTravelers}
                    <span className="ml-1 text-xs text-gray-400">(£{PRICE_GOV_GBP}/pers. ≈ {PRICE_GOV_EUR}€)</span>
                  </span>
                  <span>£{totalGovGBP} <span className="text-gray-400 text-xs">≈ {totalGovEUR}€</span></span>
                </div>
                <div className="px-4 py-2.5 flex justify-between font-extrabold text-navy-900 bg-navy-50 border-t border-navy-100">
                  <span>Total TTC</span>
                  <span>{total}€</span>
                </div>
              </div>
            </div>

            {/* Email avec confirmation par bouton */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-navy-900 text-lg">Votre adresse email</h2>
                {emailOk && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmé
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm -mt-2">
                Vous recevrez la confirmation de commande et vos résultats ETA à cette adresse.
              </p>

              {emailConfirmed ? (
                /* État : email confirmé */
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium text-sm">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={editEmail}
                    className="text-xs text-green-700 underline hover:text-green-900 font-medium"
                  >
                    Modifier
                  </button>
                </div>
              ) : (
                /* État : saisie de l'email */
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => { setEmailInput(e.target.value); setEmailError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirmEmail())}
                      placeholder="vous@example.fr"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={confirmEmail}
                      className="px-5 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      Confirmer
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-sm">{emailError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Récapitulatif final */}
            <div className="bg-navy-900 text-white rounded-2xl p-5">
              <div className="space-y-2 text-sm text-white/80 mb-4">
                <div className="flex justify-between">
                  <span>Frais de service × {numTravelers}</span>
                  <span>{totalService}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais gouvernementaux UK × {numTravelers}</span>
                  <span>£{totalGovGBP} <span className="text-white/50 text-xs">≈ {totalGovEUR}€</span></span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-lg border-t border-white/20 pt-3">
                <span>Total</span>
                <span>{total}€ TTC</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <a href="/cgv" className="underline">CGV</a> et notre{' '}
              <a href="/confidentialite" className="underline">politique de confidentialité</a>.
              ETA·UK est un service privé indépendant du gouvernement britannique.
            </p>

            <button
              type="submit"
              disabled={!emailConfirmed}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl text-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Continuer — Saisir les identités
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
