'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PRICE_SERVICE = 24
const PRICE_GOV_EUR = 26
const PRICE_TOTAL   = PRICE_SERVICE + PRICE_GOV_EUR // 50€

const MOIS = [
  { v: '01', l: 'Janvier' }, { v: '02', l: 'Février' }, { v: '03', l: 'Mars' },
  { v: '04', l: 'Avril' },   { v: '05', l: 'Mai' },     { v: '06', l: 'Juin' },
  { v: '07', l: 'Juillet' }, { v: '08', l: 'Août' },    { v: '09', l: 'Septembre' },
  { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' },{ v: '12', l: 'Décembre' },
]
const JOURS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const CURRENT_YEAR = new Date().getFullYear()
const ANNEES_DOB    = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - i))
const ANNEES_EXPIRY = Array.from({ length: 21 },  (_, i) => String(CURRENT_YEAR + i))

const NATIONALITIES = [
  'Afghanistan', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
  'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
  'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 'Bolivie',
  'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunéi', 'Bulgarie', 'Burkina Faso',
  'Burundi', 'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre',
  'Colombie', 'Comores', 'Congo', 'Corée du Sud', 'Costa Rica', "Côte d'Ivoire", 'Croatie',
  'Cuba', 'Danemark', 'Djibouti', 'Dominique', 'Égypte', 'Émirats arabes unis', 'Équateur',
  'Érythrée', 'Espagne', 'Estonie', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon',
  'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée équatoriale',
  'Guinée-Bissau', 'Guyana', 'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak',
  'Iran', 'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Koweït', 'Laos', 'Lesotho', 'Lettonie',
  'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg', 'Macédoine du Nord',
  'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Maurice',
  'Mauritanie', 'Mexique', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique',
  'Myanmar', 'Namibie', 'Népal', 'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande',
  'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palaos', 'Panama', 'Papouasie-Nouvelle-Guinée',
  'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal', 'Qatar',
  'République centrafricaine', 'République démocratique du Congo', 'République dominicaine',
  'République tchèque', 'Roumanie', 'Russie', 'Rwanda', 'Saint-Kitts-et-Nevis', 'Saint-Marin',
  'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Salvador', 'Samoa', 'São Tomé-et-Príncipe',
  'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie',
  'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie',
  'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental', 'Togo', 'Tonga',
  'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu', 'Ukraine', 'Uruguay',
  'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam', 'Yémen', 'Zambie', 'Zimbabwe',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface TravelerForm {
  prenom: string
  nom: string
  dob_jour: string
  dob_mois: string
  dob_annee: string
  lieu_naissance: string
  nationalite: string
  passport_later: boolean
  num_passeport: string
  exp_jour: string
  exp_mois: string
  exp_annee: string
  sexe: string
  criminal_record: boolean
  travel_ban: boolean
}

const EMPTY: TravelerForm = {
  prenom: '', nom: '',
  dob_jour: '', dob_mois: '', dob_annee: '',
  lieu_naissance: '', nationalite: 'France',
  passport_later: false,
  num_passeport: '',
  exp_jour: '', exp_mois: '', exp_annee: '',
  sexe: '',
  criminal_record: false, travel_ban: false,
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition bg-white"
    />
  )
}

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition bg-white appearance-none"
    >
      {children}
    </select>
  )
}

// ─── Carte voyageur accordion ─────────────────────────────────────────────────

function TravelerCard({
  index, data, onChange, isOpen, onToggle,
}: {
  index: number; data: TravelerForm; onChange: (d: TravelerForm) => void
  isOpen: boolean; onToggle: () => void
}) {
  function set<K extends keyof TravelerForm>(field: K) {
    return (value: TravelerForm[K]) => onChange({ ...data, [field]: value })
  }

  const displayName = data.prenom || data.nom
    ? `${data.prenom} ${data.nom}`.trim()
    : null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4">
      {/* En-tête accordion */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="font-bold text-gray-900 text-sm">
            Voyageur #{index + 1}
          </span>
          {displayName && (
            <span className="ml-2 text-sm text-gray-500">— {displayName}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Corps du formulaire */}
      {isOpen && (
        <div className="px-5 py-5 space-y-5">

          {/* Prénom + Nom */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Prénom(s) et deuxième prénom</Label>
              <Input
                value={data.prenom}
                onChange={set('prenom')}
                placeholder="Exactement comme sur le passeport"
              />
            </div>
            <div>
              <Label required>Nom de famille</Label>
              <Input value={data.nom} onChange={set('nom')} />
            </div>
          </div>

          {/* Date de naissance */}
          <div>
            <Label required>Date de naissance</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={data.dob_mois} onChange={set('dob_mois')}>
                <option value="">Mois</option>
                {MOIS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
              </Select>
              <Select value={data.dob_jour} onChange={set('dob_jour')}>
                <option value="">Jour</option>
                {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
              </Select>
              <Select value={data.dob_annee} onChange={set('dob_annee')}>
                <option value="">Année</option>
                {ANNEES_DOB.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </div>
          </div>

          {/* Sexe */}
          <div>
            <Label required>Sexe (tel qu'indiqué sur le passeport)</Label>
            <Select value={data.sexe} onChange={set('sexe')}>
              <option value="">Sélectionner…</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="X">Non spécifié / X</option>
            </Select>
          </div>

          {/* Lieu de naissance */}
          <div>
            <Label required>Lieu de naissance</Label>
            <Input value={data.lieu_naissance} onChange={set('lieu_naissance')} placeholder="Ville, Pays" />
          </div>

          {/* Section passeport */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Nationalité et passeport</p>

            <div>
              <Label required>Nationalité sur le passeport</Label>
              <Select value={data.nationalite} onChange={set('nationalite')}>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>

            {/* Case "remplir plus tard" */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.passport_later}
                onChange={(e) => set('passport_later')(e.target.checked as boolean)}
                className="w-4 h-4 rounded border-gray-300 text-navy-600"
              />
              <span className="text-sm text-gray-700">Ajouter les détails du passeport plus tard</span>
            </label>

            {!data.passport_later && (
              <>
                <div>
                  <Label required>Numéro de passeport</Label>
                  <Input value={data.num_passeport} onChange={set('num_passeport')} placeholder="Ex : 12AB34567" />
                </div>

                <div>
                  <Label required>Date d'expiration du passeport</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={data.exp_mois} onChange={set('exp_mois')}>
                      <option value="">Mois</option>
                      {MOIS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </Select>
                    <Select value={data.exp_jour} onChange={set('exp_jour')}>
                      <option value="">Jour</option>
                      {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </Select>
                    <Select value={data.exp_annee} onChange={set('exp_annee')}>
                      <option value="">Année</option>
                      {ANNEES_EXPIRY.map((a) => <option key={a} value={a}>{a}</option>)}
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Déclarations */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Déclarations obligatoires</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.criminal_record}
                onChange={(e) => set('criminal_record')(e.target.checked as boolean)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                Je déclare ne pas avoir de casier judiciaire, de condamnation pénale, ni avoir été expulsé d'un pays.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.travel_ban}
                onChange={(e) => set('travel_ban')(e.target.checked as boolean)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                Je déclare ne faire l'objet d'aucune interdiction de territoire ni refus de visa au Royaume-Uni ou dans un autre pays.
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar récap ────────────────────────────────────────────────────────────

function OrderSidebar({ numTravelers, loading }: { numTravelers: number; loading: boolean }) {
  const totalService = numTravelers * PRICE_SERVICE
  const totalGovEUR  = numTravelers * PRICE_GOV_EUR
  const total        = numTravelers * PRICE_TOTAL

  return (
    <div className="space-y-4">
      {/* Résumé commande */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-navy-900 text-base mb-4">ETA Royaume-Uni</h3>
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
            <span>{totalGovEUR}€</span>
          </div>
          <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{total}€ TTC</span>
          </div>
        </div>
      </div>

      {/* Bouton submit sidebar (desktop) */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement…
          </>
        ) : (
          <>Payer {total}€ et continuer</>
        )}
      </button>

      {/* Note sécurité */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Vos données sont chiffrées et transmises de manière sécurisée. Elles ne sont jamais partagées avec des tiers.
        </p>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

function IdentitePageInner() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const numTravelers = Math.max(1, parseInt(searchParams.get('n') ?? '1', 10))

  const [email,    setEmail]    = useState('')
  const [travelers, setTravelers] = useState<TravelerForm[]>(() =>
    Array.from({ length: numTravelers }, () => ({ ...EMPTY }))
  )
  const [openCards, setOpenCards] = useState<boolean[]>(() =>
    Array.from({ length: numTravelers }, (_, i) => i === 0)
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('eta_email')
    if (!stored) { router.replace('/funnel'); return }
    setEmail(stored)
  }, [router])

  function toggleCard(i: number) {
    setOpenCards((prev) => prev.map((v, idx) => idx === i ? !v : v))
  }

  function updateTraveler(index: number, data: TravelerForm) {
    setTravelers((prev) => prev.map((t, i) => (i === index ? data : t)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation déclarations et dates
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i]
      if (!t.criminal_record || !t.travel_ban) {
        setError(`Veuillez cocher les deux déclarations pour le voyageur ${i + 1}.`)
        setOpenCards((prev) => prev.map((v, idx) => idx === i ? true : v))
        return
      }
      if (!t.dob_jour || !t.dob_mois || !t.dob_annee) {
        setError(`Date de naissance incomplète pour le voyageur ${i + 1}.`)
        setOpenCards((prev) => prev.map((v, idx) => idx === i ? true : v))
        return
      }
      if (!t.passport_later && (!t.exp_jour || !t.exp_mois || !t.exp_annee)) {
        setError(`Date d'expiration du passeport incomplète pour le voyageur ${i + 1}.`)
        setOpenCards((prev) => prev.map((v, idx) => idx === i ? true : v))
        return
      }
    }

    if (!email) { router.replace('/funnel'); return }

    // Construire les dates au format YYYY-MM-DD
    const travelersPayload = travelers.map((t) => ({
      prenom: t.prenom,
      nom: t.nom,
      date_naissance: `${t.dob_annee}-${t.dob_mois}-${t.dob_jour}`,
      lieu_naissance: t.lieu_naissance,
      nationalite: t.nationalite,
      num_passeport: t.passport_later ? null : t.num_passeport,
      expiry_passeport: t.passport_later ? null : `${t.exp_annee}-${t.exp_mois}-${t.exp_jour}`,
      sexe: t.sexe,
    }))

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, numTravelers, travelers: travelersPayload }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Une erreur est survenue. Veuillez réessayer.')
        return
      }
      sessionStorage.removeItem('eta_email')
      sessionStorage.removeItem('eta_num_travelers')
      window.location.href = data.url
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
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
          Données chiffrées
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-green-600 font-semibold">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
              Votre commande
            </div>
            <div className="flex-1 h-0.5 bg-green-300 rounded" />
            <div className="flex items-center gap-1.5 text-navy-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">2</div>
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
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Vos informations personnelles</h2>
                <p className="text-sm text-gray-500 mb-6">Ces informations doivent correspondre exactement à votre passeport.</p>

                {travelers.map((traveler, i) => (
                  <TravelerCard
                    key={i}
                    index={i}
                    data={traveler}
                    onChange={(d) => updateTraveler(i, d)}
                    isOpen={openCards[i]}
                    onToggle={() => toggleCard(i)}
                  />
                ))}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                    {error}
                  </div>
                )}

                {/* Navigation bas */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/funnel')}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:border-gray-300 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Précédent
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Chargement…
                      </>
                    ) : (
                      <>
                        Enregistrer et continuer
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Colonne droite : sidebar sticky */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <OrderSidebar numTravelers={numTravelers} loading={loading} />
                </div>
              </div>
            </div>

            {/* Sidebar mobile (sous le formulaire) */}
            <div className="lg:hidden mt-6 border-t border-gray-200 pt-6">
              <OrderSidebar numTravelers={numTravelers} loading={loading} />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function IdentitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    }>
      <IdentitePageInner />
    </Suspense>
  )
}
