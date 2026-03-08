# ETA·UK Service

Site web + agent IA pour déléguer les demandes d'ETA (Electronic Travel Authorisation) au Royaume-Uni.

## Stack technique

- **Frontend/Backend** : Next.js 14 (App Router)
- **Base de données** : SQLite via `better-sqlite3`
- **Paiements** : Stripe Checkout
- **Agent IA** : Claude (`claude-opus-4-6`) + computer-use API + Playwright
- **Emails** : Nodemailer (SMTP)

## Architecture du funnel

```
Landing page (/)
    ↓
Funnel - Choix voyageurs + email (/funnel)
    ↓
Stripe Checkout (paiement sécurisé)
    ↓ [webhook → marque commande comme payée]
Formulaire d'identité post-paiement (/funnel/identite?order_id=…&n=…)
    ↓ [POST /api/submit-travelers]
Page de confirmation (/confirmation?order_id=…)
    ↓ [agent IA lance en arrière-plan]
Email résultats ETA (envoyé par l'agent quand terminé)
```

## Installation

### 1. Prérequis

- Node.js 18+
- Un compte Stripe
- Une clé API Anthropic
- Un serveur SMTP (Gmail, Mailgun, Resend, etc.)

### 2. Cloner et installer

```bash
cd eta-uk-service
npm install
npx playwright install chromium
```

### 3. Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | URL du site (ex: `https://eta-uk.fr`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `SERVICE_PRICE_CENTS` | Prix en centimes (défaut: 3900 = 39€) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic |
| `SMTP_*` | Config SMTP pour emails |
| `COMPANY_CARD_*` | Carte société pour payer les £10 gouvernementaux |

### 4. Configurer le webhook Stripe

```bash
# En développement, utiliser le CLI Stripe
stripe listen --forward-to localhost:3000/api/webhook
```

En production, configurer l'endpoint dans le tableau de bord Stripe :
- URL : `https://votre-domaine.fr/api/webhook`
- Événement : `checkout.session.completed`

### 5. Lancer le serveur

```bash
# Développement
npm run dev

# Production
npm run build && npm start
```

## Structure des fichiers

```
app/
├── page.tsx                          # Landing page (en français)
├── funnel/
│   ├── page.tsx                      # Étape 1 : choix voyageurs + email
│   └── identite/page.tsx             # Étape 3 : formulaire identité (post-paiement)
├── confirmation/page.tsx             # Page de confirmation
└── api/
    ├── create-checkout/route.ts      # Crée session Stripe + commande DB
    ├── webhook/route.ts              # Webhook Stripe (confirme paiement)
    ├── order-status/route.ts         # Vérifie statut commande (fallback)
    └── submit-travelers/route.ts     # Reçoit identités, lance l'agent IA

lib/
├── db.ts                             # SQLite : orders + travelers
├── stripe.ts                         # Config Stripe
├── email.ts                          # Emails (confirmation + résultats)
└── eta-agent.ts                      # Agent IA (Claude computer-use + Playwright)
```

## Agent IA

L'agent utilise Claude claude-opus-4-6 avec l'API **computer-use** pour piloter Playwright et naviguer sur le portail officiel du Home Office britannique (`apply.eta.homeoffice.gov.uk`).

**Flux de l'agent :**
1. Ouvre un navigateur Playwright (headless)
2. Capture des screenshots de chaque étape
3. Envoie le screenshot à Claude avec les informations du voyageur
4. Claude répond avec des actions (clic, frappe, scroll…)
5. Playwright exécute les actions
6. Répète jusqu'à l'approbation ou une erreur
7. Met à jour la base de données
8. Envoie l'email de résultat

## Modèle économique

- **Prix facturé** : 39€ par personne (configurable via `SERVICE_PRICE_CENTS`)
- **Frais gouvernementaux** : £10/personne, payés par la carte société (`COMPANY_CARD_*`)
- **Marge brute** : ~27€/personne (après frais gov + frais Stripe ~1,5%)

## Points légaux importants

1. **Ajouter une page CGV** (`/cgv`) avec les conditions de service
2. **Ajouter une politique de confidentialité** (`/confidentialite`) conforme RGPD
3. **Ajouter des mentions légales** (`/mentions-legales`)
4. Être clair sur le fait qu'il s'agit d'un **service privé tiers**, pas un site gouvernemental
5. La **garantie de remboursement** doit être précisée (frais de service uniquement, pas les £10 gouvernementaux)

## Déploiement recommandé

- **Hébergement** : Vercel, Railway, ou VPS (DigitalOcean, Scaleway)
- **Base de données** : SQLite convient jusqu'à ~1000 commandes/mois. Au-delà, migrer vers PostgreSQL
- **Domaine** : `eta-uk.fr` ou similaire
- **SSL** : Obligatoire (Stripe et conformité RGPD)

> **Note** : En production, envisager de déplacer l'exécution de l'agent IA vers une queue (Bull, BullMQ) pour une meilleure résilience et scalabilité.
