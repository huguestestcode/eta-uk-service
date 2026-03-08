'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRAVELER_OPTIONS = [1, 2, 3, 4, 5, 6]

const PRICE_SERVICE = 20
const PRICE_GOV_GBP = 16
const PRICE_GOV_EUR = 19
const PRICE_TOTAL   = PRICE_SERVICE + PRICE_GOV_EUR // 39€

export default function FunnelPage() {
  const router = useRouter()
  const [numTravelers, setNumTravelers] = useState(1)
  const [emailInput,    setEmailInput]    = useState('')
  const [email,         setEmail]         = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [emailError,    setEmailError]    = useState('')

  const totalService = numTravelers * PRICE_SERVICE
  const totalGovGBP  = numTravelers * PRICE_GOV_GBP
  const totalGovEUR  = numTravelers * PRICE_GOV_EUR
  const total        = numTravelers * PRICE_TOTAL

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-20">
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

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-navy-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">1</div>
              Votre commande
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">2</div>
              Informations personnelles
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</div>
              Paiement
            </div>
          </div>
        </div>
      </div>

      {/* Banner titre */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-navy-900 rounded-full" />
            <div>
              <h1 className="font-bold text-navy-900 text-lg">Formulaire de demande ETA</h1>
              <p className="text-sm text-gray-500">Assurez-vous que toutes les informations correspondent exactement à votre passeport.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">

              {/* Colonne gauche : formulaire */}
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Votre demande ETA UK</h2>

                {/* Nombre de voyageurs */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-1">Nombre de voyageurs</h3>
                  <p className="text-sm text-gray-500 mb-4">
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
                            : 'border-gray-200 bg-white text-gray-700 hover:border-navy-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">Votre adresse email</h3>
                    {emailConfirmed && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmé
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Vous recevrez vos résultats ETA et la confirmation de commande à cette adresse.
                  </p>

                  {emailConfirmed ? (
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
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => { setEmailInput(e.target.value); setEmailError('') }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirmEmail())}
                          placeholder="vous@example.fr"
                          className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                        />
                        <button
                          type="button"
                          onClick={confirmEmail}
                          className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
                        >
                          Confirmer
                        </button>
                      </div>
                      {emailError && <p className="text-red-600 text-xs">{emailError}</p>}
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  En continuant, vous acceptez nos{' '}
                  <a href="/cgv" className="underline">CGV</a> et notre{' '}
                  <a href="/confidentialite" className="underline">politique de confidentialité</a>.
                  ETA·UK est un service privé indépendant du gouvernement britannique.
                </p>

                {/* Bouton navigation */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!emailConfirmed}
                    className="flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    Enregistrer et continuer
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Colonne droite : sidebar sticky */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-navy-900 text-base">ETA Royaume-Uni</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>ETA UK</span>
                        <span>{numTravelers} voyageur{numTravelers > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Frais de service</span>
                        <span>{totalService}€</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Frais gouvernementaux UK</span>
                        <span>£{totalGovGBP} <span className="text-gray-400 text-xs">≈ {totalGovEUR}€</span></span>
                      </div>
                      <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>{total}€ TTC</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!emailConfirmed}
                      className="w-full mt-2 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Enregistrer et continuer
                    </button>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-800 flex items-start gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Vos données sont chiffrées et transmises de manière sécurisée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar mobile */}
            <div className="lg:hidden mt-6 border-t border-gray-200 pt-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-navy-900 text-base mb-3">ETA Royaume-Uni</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>ETA UK</span>
                    <span>{numTravelers} voyageur{numTravelers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Frais de service</span>
                    <span>{totalService}€</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Frais gouvernementaux UK</span>
                    <span>£{totalGovGBP} <span className="text-gray-400 text-xs">≈ {totalGovEUR}€</span></span>
                  </div>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{total}€ TTC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
