import Link from 'next/link'

// ─── Données statiques ────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '1',
    title: 'Choisissez vos voyageurs',
    desc: 'Indiquez le nombre de personnes (vous et vos accompagnants). Comptez 2 minutes.',
    icon: '👥',
  },
  {
    n: '2',
    title: 'Payez en ligne',
    desc: 'Paiement sécurisé par carte bancaire. Frais gouvernementaux inclus.',
    icon: '💳',
  },
  {
    n: '3',
    title: 'Renseignez vos identités',
    desc: 'Numéro de passeport, date de naissance… Formulaire simple en français.',
    icon: '📋',
  },
  {
    n: '4',
    title: 'Notre IA gère tout',
    desc: 'Notre agent soumet automatiquement vos demandes auprès du Home Office britannique.',
    icon: '🤖',
  },
  {
    n: '5',
    title: 'Recevez votre ETA',
    desc: 'L\'approbation arrive par email, liée à votre passeport. Bon voyage !',
    icon: '✈️',
  },
]

const BENEFITS = [
  {
    icon: '🇫🇷',
    title: 'Tout en français',
    desc: 'Fini le site gouvernemental britannique en anglais. Notre formulaire et notre support sont 100 % en français.',
  },
  {
    icon: '⚡',
    title: 'Traitement en 24h',
    desc: 'Notre agent IA soumet votre demande immédiatement après réception de vos informations.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Groupes et familles',
    desc: 'Gérez plusieurs voyageurs en une seule commande. Parfait pour les familles ou les groupes.',
  },
  {
    icon: '🔒',
    title: 'Sécurisé & confidentiel',
    desc: 'Vos données sont chiffrées et ne sont utilisées que pour votre demande ETA.',
  },
]

const FAQS = [
  {
    q: "Qu'est-ce que l'ETA UK ?",
    a: "L'ETA (Electronic Travel Authorisation) est une autorisation électronique obligatoire pour entrer au Royaume-Uni. Depuis le 2 avril 2025, les ressortissants français et de nombreux autres pays doivent en disposer avant d'embarquer, même pour un transit ou un court séjour.",
  },
  {
    q: 'Qui a besoin d\'une ETA ?',
    a: 'Tous les citoyens français (et de nombreux pays sans obligation de visa UK) voyageant au Royaume-Uni. L\'ETA est requise pour le tourisme, les affaires, les visites familiales et les transits. Elle n\'est pas nécessaire si vous avez déjà un visa UK ou si vous êtes résident britannique.',
  },
  {
    q: 'Combien de temps est valable une ETA ?',
    a: 'L\'ETA est valable 2 ans à compter de la date d\'approbation (ou jusqu\'à l\'expiration de votre passeport si elle survient avant). Elle permet des séjours multiples de 6 mois maximum par visite.',
  },
  {
    q: 'Quelle est la différence entre votre service et le site officiel ?',
    a: 'Vous pouvez faire votre demande directement sur le site du gouvernement britannique en anglais, avec un délai de traitement variable. Notre service vous permet de déléguer entièrement la démarche : formulaire en français, agent IA qui soumet pour vous, et suivi inclus. Les frais gouvernementaux (£16/personne) sont inclus dans notre tarif.',
  },
  {
    q: "Que se passe-t-il si ma demande est refusée ?",
    a: 'En cas de refus, nous vous contactons immédiatement pour vous expliquer les raisons et explorer les alternatives. Nous remboursons nos frais de service (hors frais gouvernementaux de £16 non remboursables par le gouvernement UK).',
  },
  {
    q: 'Dois-je imprimer mon ETA ?',
    a: "Non. L'ETA est liée électroniquement à votre numéro de passeport. Les compagnies aériennes et les autorités frontalières la vérifient automatiquement. Il vous suffit de présenter le passeport utilisé pour la demande.",
  },
  {
    q: 'Combien de temps dure le traitement ?',
    a: 'Le délai moyen est de quelques heures. Dans la majorité des cas, l\'ETA est approuvée le jour même. Le gouvernement britannique indique jusqu\'à 3 jours ouvrés dans les cas exceptionnels.',
  },
  {
    q: 'Puis-je faire une demande pour toute ma famille ?',
    a: 'Oui ! Lors de votre commande, indiquez le nombre total de voyageurs. Vous remplirez ensuite les informations de chaque personne. Chaque ETA est individuelle (liée au passeport de chaque voyageur).',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sophie M.',
    location: 'Lyon',
    text: 'Super simple ! J\'ai délégué les demandes pour moi et mon mari en 10 minutes. On a reçu nos ETA le soir même. Je recommande vivement.',
    stars: 5,
  },
  {
    name: 'Pierre L.',
    location: 'Paris',
    text: 'Le site gouvernemental britannique est en anglais et vraiment peu clair. Ici, tout est en français et le service a été ultra-rapide. Impeccable.',
    stars: 5,
  },
  {
    name: 'Famille Durand',
    location: 'Bordeaux',
    text: 'Nous étions 4 pour nos vacances à Londres. Une seule commande et tout a été géré. Les ETA sont arrivées en moins de 4 heures !',
    stars: 5,
  },
]

// ─── Composants internes ──────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-navy-900 tracking-tight">ETA</span>
            <span className="text-2xl font-extrabold text-gold-500 tracking-tight">·UK</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#comment-ca-marche" className="hover:text-navy-900 transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-navy-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-navy-900 transition-colors">FAQ</a>
          </nav>
          <Link
            href="/funnel"
            className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Commencer →
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Obligatoire depuis le 2 avril 2025 pour les Français
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Votre ETA britannique,
                <br />
                <span className="text-gold-400">prêt en 24h</span>
              </h1>

              <p className="text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
                Voyagez au Royaume-Uni sans stress. Nous gérons entièrement votre demande
                d'autorisation électronique — en français, pour vous et vos accompagnants.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/funnel" className="btn-primary text-xl px-10 py-5">
                  Obtenir mon ETA maintenant
                </Link>
                <a href="#comment-ca-marche" className="btn-secondary text-white bg-white/10 border-white/30 hover:bg-white/20">
                  Comment ça marche ?
                </a>
              </div>

              {/* Trust line */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Paiement 100% sécurisé
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  98 % d'approbation
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Remboursé si refus
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  Formulaire en français
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="bg-navy-900 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '+12 000', label: 'demandes traitées' },
                { val: '98 %', label: 'taux d\'approbation' },
                { val: '< 4h', label: 'délai moyen' },
                { val: '5★', label: 'avis clients' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-gold-400">{s.val}</div>
                  <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Qu'est-ce que l'ETA ── */}
        <section className="py-16 bg-navy-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="badge mb-4">🇬🇧 Nouvelle obligation</div>
                <h2 className="text-3xl font-extrabold text-navy-900 mb-4">
                  Vous préparez un voyage au Royaume-Uni ?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depuis le <strong>2 avril 2025</strong>, tous les ressortissants français doivent
                  obtenir une <strong>ETA (Electronic Travel Authorisation)</strong> avant d'embarquer
                  pour le Royaume-Uni — même pour un simple week-end à Londres, un transit, ou
                  une visite familiale.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Sans ETA valide, la compagnie aérienne peut refuser votre embarquement.
                  Le processus officiel se fait en anglais sur le site du gouvernement britannique
                  — c'est là qu'on intervient.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    'Tourisme, vacances & city-trips',
                    'Voyages d\'affaires',
                    'Visites familiales & amicales',
                    'Transits via les aéroports UK',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🕐', title: 'Valable 2 ans', desc: 'Ou jusqu\'à l\'expiration de votre passeport' },
                  { icon: '🔄', title: 'Multi-entrées', desc: 'Voyages illimités pendant 2 ans' },
                  { icon: '📱', title: 'Sans papier', desc: 'Liée à votre passeport électroniquement' },
                  { icon: '💶', title: 'Frais inclus', desc: 'Les £16 gouvernementaux sont dans notre tarif' },
                ].map((item) => (
                  <div key={item.title} className="card text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold text-navy-900 text-sm">{item.title}</div>
                    <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Comment ça marche ── */}
        <section id="comment-ca-marche" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="badge mb-4">Processus simplifié</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
                5 étapes, moins de 10 minutes de votre temps
              </h2>
              <p className="text-gray-500 mt-3 text-lg">Le reste, c'est notre agent IA qui s'en charge.</p>
            </div>

            <div className="relative">
              {/* Ligne de connexion desktop */}
              <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-gradient-to-r from-navy-100 via-navy-300 to-navy-100" />

              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                {STEPS.map((step) => (
                  <div key={step.n} className="text-center relative">
                    <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
                      {step.icon}
                    </div>
                    <div className="text-xs font-bold text-navy-600 uppercase tracking-widest mb-1">
                      Étape {step.n}
                    </div>
                    <h3 className="font-bold text-navy-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/funnel" className="btn-primary">
                Commencer ma demande – 42€ HT/personne →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pourquoi nous ── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="badge mb-4">Nos avantages</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
                Pourquoi nous faire confiance ?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b) => (
                <div key={b.title} className="card hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{b.icon}</div>
                  <h3 className="font-bold text-navy-900 text-lg mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Comparatif */}
            <div className="mt-16 overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    <th className="text-left px-6 py-4 font-semibold">Critère</th>
                    <th className="px-6 py-4 font-semibold text-center">
                      <span className="text-gold-400">ETA·UK Service</span>
                    </th>
                    <th className="px-6 py-4 font-semibold text-center text-white/60">Site officiel UK</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Langue', '🇫🇷 Français', '🇬🇧 Anglais uniquement'],
                    ['Remplissage formulaire', 'Par notre agent IA', 'Vous-même'],
                    ['Support', 'Inclus', 'Non disponible'],
                    ['Groupe / famille', 'Une seule commande', 'Une par personne'],
                    ['Suivi par email', '✓ Inclus', '✗ Basique'],
                    ['Tarif', '42€ HT/pers. tout compris', '£10/pers. + erreurs potentielles'],
                  ].map(([crit, nous, officiel], i) => (
                    <tr key={crit} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 font-medium text-navy-900">{crit}</td>
                      <td className="px-6 py-3 text-center text-green-700 font-medium">{nous}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{officiel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Tarifs ── */}
        <section id="tarifs" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="badge mb-4">Tarification simple</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
                Un prix clair, sans surprise
              </h2>
              <p className="text-gray-500 mt-3">Frais gouvernementaux inclus dans tous nos tarifs.</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-3xl p-8 text-white text-center shadow-2xl">
                <div className="inline-flex items-center gap-2 bg-gold-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                  ⭐ Offre tout compris
                </div>
                <div className="text-7xl font-extrabold mb-1">42<span className="text-4xl">€</span><span className="text-2xl font-semibold"> HT</span></div>
                <div className="text-white/50 text-sm mb-1">50€ TTC par personne</div>
                <div className="text-white/70 text-base mb-6">frais gouvernementaux inclus</div>

                <div className="bg-white/10 rounded-2xl p-6 text-left mb-8 space-y-3">
                  {[
                    '✓ Frais gouvernementaux UK (£16) inclus',
                    '✓ Formulaire en français',
                    '✓ Soumission par agent IA',
                    '✓ Suivi de demande par email',
                    '✓ Remboursement si refus (frais de service)',
                    '✓ Plusieurs voyageurs en 1 commande',
                    '✓ Support client inclus',
                  ].map((item) => (
                    <div key={item} className="text-white/90 text-sm">{item}</div>
                  ))}
                </div>

                <Link href="/funnel" className="btn-primary w-full justify-center text-xl py-5">
                  Commencer ma demande →
                </Link>

                <p className="text-white/50 text-xs mt-4">
                  Paiement sécurisé par Stripe. Données chiffrées. Remboursement sous 48h si refus.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { n: '1', price: '42€ HT', sub: '50€ TTC', label: '1 voyageur' },
                  { n: '2', price: '84€ HT', sub: '100€ TTC', label: '2 voyageurs' },
                  { n: '4', price: '168€ HT', sub: '200€ TTC', label: '4 voyageurs' },
                ].map((ex) => (
                  <div key={ex.n} className="card text-center">
                    <div className="text-xl font-extrabold text-navy-900">{ex.price}</div>
                    <div className="text-xs text-gray-400">{ex.sub}</div>
                    <div className="text-sm text-gray-500 mt-1">{ex.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Témoignages ── */}
        <section className="py-20 bg-navy-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="badge mb-4">Avis clients</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
                Ils nous ont fait confiance
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card">
                  <Stars count={t.stars} />
                  <p className="text-gray-600 mt-3 mb-4 leading-relaxed italic">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-navy-900">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="badge mb-4">Questions fréquentes</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900">
                Tout ce que vous devez savoir
              </h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq) => (
                <details key={faq.q} className="faq-item card">
                  <summary>
                    <span>{faq.q}</span>
                    <svg
                      className="w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 pb-4 leading-relaxed text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-20 bg-gradient-to-br from-navy-950 to-navy-800 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Prêt à partir au Royaume-Uni ?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Commencez votre demande maintenant. Moins de 10 minutes de votre côté,
              notre agent IA fait le reste.
            </p>
            <Link href="/funnel" className="btn-primary text-xl px-12 py-5">
              Obtenir mon ETA – 42€ HT/personne →
            </Link>
            <p className="text-white/40 text-sm mt-6">
              Service disponible 24h/24 · 7j/7 · Traitement immédiat
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-navy-950 text-white/50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-1 mb-3">
                <span className="font-extrabold text-white">ETA</span>
                <span className="font-extrabold text-gold-400">·UK</span>
              </div>
              <p className="text-sm leading-relaxed">
                Service privé d'assistance aux démarches ETA UK.
                Indépendant du gouvernement britannique.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/funnel" className="hover:text-white transition-colors">Commencer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="/cgv" className="hover:text-white transition-colors">CGV</a></li>
                <li><a href="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="mailto:contact@eta-uk.fr" className="hover:text-white transition-colors">contact@eta-uk.fr</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} ETA UK Service. Tous droits réservés.</p>
            <p className="text-center max-w-md">
              ETA·UK est un service tiers privé, non affilié au gouvernement britannique (HMPO / Home Office).
              Les frais gouvernementaux de £16 sont inclus dans notre tarif.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
