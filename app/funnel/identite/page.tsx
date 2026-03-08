'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TravelerForm {
  prenom: string
  nom: string
  date_naissance: string
  lieu_naissance: string
  nationalite: string
  num_passeport: string
  expiry_passeport: string
  email: string
  sexe: string
  criminal_record: boolean
  travel_ban: boolean
}

const EMPTY_TRAVELER: TravelerForm = {
  prenom: '',
  nom: '',
  date_naissance: '',
  lieu_naissance: '',
  nationalite: 'France',
  num_passeport: '',
  expiry_passeport: '',
  email: '',
  sexe: '',
  criminal_record: false,
  travel_ban: false,
}

const NATIONALITIES = [
  'Afghanistan', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
  'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
  'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 'Bolivie',
  'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunéi', 'Bulgarie', 'Burkina Faso',
  'Burundi', 'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre',
  'Colombie', 'Comores', 'Congo', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie',
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

// ─── Champ de formulaire ──────────────────────────────────────────────────────

function Field({
  label, id, type = 'text', value, onChange, required = true, hint, min, max,
}: {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  hint?: string
  min?: string
  max?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ─── Carte voyageur ───────────────────────────────────────────────────────────

function TravelerCard({
  index,
  data,
  onChange,
  isMain,
}: {
  index: number
  data: TravelerForm
  onChange: (d: TravelerForm) => void
  isMain: boolean
}) {
  function set(field: keyof TravelerForm) {
    return (value: string | boolean) => onChange({ ...data, [field]: value })
  }

  return (
    <div className="card border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center">
          {index + 1}
        </div>
        <div>
          <h3 className="font-bold text-navy-900">
            {isMain ? 'Voyageur principal (vous)' : `Accompagnant ${index}`}
          </h3>
          <p className="text-xs text-gray-400">Saisissez exactement les informations de votre passeport</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Prénom(s)"
          id={`prenom-${index}`}
          value={data.prenom}
          onChange={set('prenom')}
          hint="Exactement comme sur le passeport"
        />
        <Field
          label="Nom de famille"
          id={`nom-${index}`}
          value={data.nom}
          onChange={set('nom')}
        />
        <Field
          label="Date de naissance"
          id={`dob-${index}`}
          type="date"
          value={data.date_naissance}
          onChange={set('date_naissance')}
          max={new Date().toISOString().split('T')[0]}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexe <span className="text-red-500">*</span>
          </label>
          <select
            value={data.sexe}
            onChange={(e) => set('sexe')(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors bg-white"
          >
            <option value="">Sélectionner…</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
            <option value="X">Non spécifié / X</option>
          </select>
        </div>
        <Field
          label="Lieu de naissance"
          id={`lieu-${index}`}
          value={data.lieu_naissance}
          onChange={set('lieu_naissance')}
          hint="Ville, Pays"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationalité <span className="text-red-500">*</span>
          </label>
          <select
            value={data.nationalite}
            onChange={(e) => set('nationalite')(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navy-500 transition-colors bg-white"
          >
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <Field
          label="Numéro de passeport"
          id={`passport-${index}`}
          value={data.num_passeport}
          onChange={set('num_passeport')}
          hint="Ex : 12AB34567 – sans espaces"
        />
        <Field
          label="Date d'expiration du passeport"
          id={`expiry-${index}`}
          type="date"
          value={data.expiry_passeport}
          onChange={set('expiry_passeport')}
          min={new Date().toISOString().split('T')[0]}
          hint="Doit être valide pour votre voyage"
        />
        <div className="sm:col-span-2">
          <Field
            label="Email (pour recevoir les résultats ETA)"
            id={`email-${index}`}
            type="email"
            value={data.email}
            onChange={set('email')}
          />
        </div>
      </div>

      {/* Questions obligatoires */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-amber-800">
          Déclarations obligatoires — à confirmer pour chaque voyageur
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.criminal_record}
            onChange={(e) => set('criminal_record')(e.target.checked)}
            required
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-navy-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            Je déclare ne pas avoir de casier judiciaire, de condamnation pénale, ni avoir été
            expulsé d'un pays.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.travel_ban}
            onChange={(e) => set('travel_ban')(e.target.checked)}
            required
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-navy-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            Je déclare ne faire l'objet d'aucune interdiction de territoire ni d'aucun refus
            de visa au Royaume-Uni ou dans un autre pays.
          </span>
        </label>
      </div>
    </div>
  )
}

// ─── Page (inner) ─────────────────────────────────────────────────────────────

function IdentitePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const numTravelers = parseInt(searchParams.get('n') ?? '1', 10)

  const [email, setEmail] = useState('')
  const [travelers, setTravelers] = useState<TravelerForm[]>(() =>
    Array.from({ length: Math.max(1, numTravelers) }, () => ({ ...EMPTY_TRAVELER }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('eta_email')
    if (!storedEmail) {
      router.replace('/funnel')
      return
    }
    setEmail(storedEmail)
  }, [router])

  function updateTraveler(index: number, data: TravelerForm) {
    setTravelers((prev) => prev.map((t, i) => (i === index ? data : t)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    for (let i = 0; i < travelers.length; i++) {
      if (!travelers[i].criminal_record || !travelers[i].travel_ban) {
        setError(`Veuillez cocher les deux déclarations pour le voyageur ${i + 1}.`)
        return
      }
    }

    if (!email) {
      router.replace('/funnel')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, numTravelers, travelers }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      // Nettoyer le sessionStorage avant la redirection
      sessionStorage.removeItem('eta_email')
      sessionStorage.removeItem('eta_num_travelers')

      window.location.href = data.url
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const PRICE_SERVICE = 27
  const PRICE_GOV_GBP = 10
  const PRICE_GOV_EUR = 12
  const total         = numTravelers * (PRICE_SERVICE + PRICE_GOV_EUR)
  const totalService  = numTravelers * PRICE_SERVICE
  const totalGovGBP   = numTravelers * PRICE_GOV_GBP
  const totalGovEUR   = numTravelers * PRICE_GOV_EUR

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
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

      {/* Indicateur étapes */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-green-600 font-semibold">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
              Commande
            </div>
            <div className="flex-1 h-0.5 bg-green-300 rounded" />
            <div className="flex items-center gap-1.5 text-navy-900 font-semibold">
              <div className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">2</div>
              Identités
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</div>
              Paiement
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900">
              Informations des voyageurs
            </h1>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              Renseignez les informations <strong>exactement comme sur chaque passeport</strong>.
              Notre agent IA les utilisera pour soumettre les demandes ETA.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {travelers.map((traveler, i) => (
              <TravelerCard
                key={i}
                index={i}
                data={traveler}
                onChange={(d) => updateTraveler(i, d)}
                isMain={i === 0}
              />
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Récapitulatif prix */}
            <div className="bg-navy-900 text-white rounded-2xl p-5">
              <div className="space-y-2 text-sm text-white/80 mb-4">
                <div className="flex justify-between">
                  <span>Frais de service ETA·UK × {numTravelers}</span>
                  <span>{totalService}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais gouvernementaux UK × {numTravelers} <span className="text-white/50 text-xs">(£{PRICE_GOV_GBP}/pers.)</span></span>
                  <span>£{totalGovGBP} <span className="text-white/50 text-xs">≈ {totalGovEUR}€</span></span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-lg border-t border-white/20 pt-3">
                <span>Total</span>
                <span>{total}€ TTC</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl text-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Chargement…
                </>
              ) : (
                <>
                  Payer {total}€ – Finaliser
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>

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

// ─── Page (avec Suspense pour useSearchParams) ────────────────────────────────

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
