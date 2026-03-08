import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ETA UK Service – Votre autorisation de voyage britannique en 24h',
  description:
    'Obtenez votre ETA (Electronic Travel Authorisation) pour le Royaume-Uni rapidement et en français. Service privé de délégation – 39€ par personne, frais gouvernementaux inclus.',
  keywords: 'ETA UK, autorisation voyage Royaume-Uni, ETA britannique, visa UK, Angleterre',
  openGraph: {
    title: 'ETA UK Service – Autorisation de voyage en 24h',
    description: 'Déléguez votre demande ETA UK. Rapide, en français, 39€/personne.',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
