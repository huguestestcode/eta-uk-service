/**
 * Agent IA – Soumission automatique des demandes ETA UK
 *
 * Utilise Claude computer-use + Playwright pour naviguer sur le portail
 * officiel du Home Office et soumettre les demandes ETA pour chaque voyageur.
 */

import Anthropic from '@anthropic-ai/sdk'
import { chromium, Browser, Page } from 'playwright'
import { updateTraveler, updateOrderStatus, getTravelersByOrder, type Traveler } from './db'
import { sendETAResults } from './email'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Dimensions du viewport simulé
const VIEWPORT = { width: 1280, height: 800 }

// ─── Point d'entrée principal ────────────────────────────────────────────────

export async function processOrder(orderId: string, orderEmail: string): Promise<void> {
  const travelers = getTravelersByOrder(orderId)
  if (!travelers.length) return

  updateOrderStatus(orderId, 'processing')

  let browser: Browser | null = null
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    })

    for (const traveler of travelers) {
      await processSingleETA(browser, traveler)
    }

    // Vérifier si toutes les ETA ont réussi
    const updated = getTravelersByOrder(orderId)
    const allDone = updated.every((t) => t.eta_status !== 'pending' && t.eta_status !== 'processing')

    if (allDone) {
      const allApproved = updated.every((t) => t.eta_status === 'approved')
      updateOrderStatus(orderId, allApproved ? 'completed' : 'failed')
      await sendETAResults(orderEmail, updated)
    }
  } catch (err) {
    console.error('[ETA Agent] Erreur globale:', err)
    updateOrderStatus(orderId, 'failed')
  } finally {
    if (browser) await browser.close()
  }
}

// ─── Traitement d'un voyageur ─────────────────────────────────────────────────

async function processSingleETA(browser: Browser, traveler: Traveler): Promise<void> {
  updateTraveler(traveler.id, { eta_status: 'processing' })

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  })

  const page = await context.newPage()

  try {
    await page.goto('https://apply.eta.homeoffice.gov.uk/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    const result = await runComputerUseAgent(page, traveler)

    if (result.success) {
      updateTraveler(traveler.id, {
        eta_status: 'approved',
        eta_reference: result.reference,
      })
    } else {
      updateTraveler(traveler.id, {
        eta_status: 'failed',
        eta_error: result.error ?? 'Erreur inconnue',
      })
    }
  } catch (err) {
    updateTraveler(traveler.id, {
      eta_status: 'failed',
      eta_error: String(err),
    })
  } finally {
    await context.close()
  }
}

// ─── Boucle agent computer-use ────────────────────────────────────────────────

interface AgentResult {
  success: boolean
  reference?: string
  error?: string
}

async function runComputerUseAgent(page: Page, traveler: Traveler): Promise<AgentResult> {
  const systemPrompt = buildSystemPrompt(traveler)

  // Historique de messages pour la conversation multi-tours
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: 'user',
      content: 'Commence la demande ETA UK pour ce voyageur. Navigue sur le site et remplis tous les champs requis.',
    },
  ]

  for (let step = 0; step < 40; step++) {
    // Capture d'écran de l'état courant
    const screenshot = await page.screenshot({ type: 'png', fullPage: false })
    const b64 = screenshot.toString('base64')

    // Ajouter la capture au dernier message utilisateur
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'user' && Array.isArray(lastMsg.content)) {
      lastMsg.content.push({
        type: 'tool_result',
        tool_use_id: 'screenshot_' + step,
        content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } }],
      } as Anthropic.Beta.BetaToolResultBlockParam)
    } else {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'screenshot_' + step,
            content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } }],
          } as Anthropic.Beta.BetaToolResultBlockParam,
        ],
      })
    }

    const response = await client.beta.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools: [
        {
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: VIEWPORT.width,
          display_height_px: VIEWPORT.height,
        },
      ],
      messages,
      betas: ['computer-use-2024-10-22'],
    })

    // Construire la réponse assistant
    const assistantContent: Anthropic.Beta.BetaContentBlockParam[] = []

    for (const block of response.content) {
      if (block.type === 'text') {
        assistantContent.push({ type: 'text', text: block.text })

        // Vérifier si l'agent indique qu'il a terminé
        if (block.text.includes('DONE:')) {
          const ref = block.text.split('DONE:')[1].trim().split(/\s/)[0]
          return { success: true, reference: ref }
        }
        if (block.text.includes('ERROR:')) {
          const err = block.text.split('ERROR:')[1].trim()
          return { success: false, error: err }
        }
        if (block.text.includes('APPROVED') || block.text.toLowerCase().includes('approved')) {
          const refMatch = block.text.match(/[A-Z0-9]{8,}/)?.[0]
          return { success: true, reference: refMatch }
        }
      }

      if (block.type === 'tool_use' && block.name === 'computer') {
        assistantContent.push({
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        })

        // Exécuter l'action dans Playwright
        await executeComputerAction(page, block.input as ComputerAction, block.id, step)
      }
    }

    messages.push({ role: 'assistant', content: assistantContent })

    if (response.stop_reason === 'end_turn' && !response.content.some((b) => b.type === 'tool_use')) {
      break
    }

    // Pause naturelle entre les actions
    await delay(800 + Math.random() * 500)
  }

  return { success: false, error: 'Nombre maximum d\'étapes atteint' }
}

// ─── Exécution des actions computer-use ──────────────────────────────────────

interface ComputerAction {
  action: string
  coordinate?: [number, number]
  text?: string
  button?: string
  direction?: string
  amount?: number
}

async function executeComputerAction(
  page: Page,
  action: ComputerAction,
  _toolId: string,
  _step: number
): Promise<void> {
  const { action: act, coordinate, text, button, direction, amount } = action

  switch (act) {
    case 'screenshot':
      // Juste capturer – sera fait au prochain tour
      break

    case 'click': {
      if (!coordinate) break
      const [x, y] = coordinate
      await page.mouse.move(x, y, { steps: 5 })
      await delay(100)
      if (button === 'right') {
        await page.mouse.click(x, y, { button: 'right' })
      } else {
        await page.mouse.click(x, y)
      }
      await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {})
      break
    }

    case 'double_click': {
      if (!coordinate) break
      const [x, y] = coordinate
      await page.mouse.dblclick(x, y)
      break
    }

    case 'type': {
      if (!text) break
      // Simuler une frappe humaine
      for (const char of text) {
        await page.keyboard.type(char)
        await delay(40 + Math.random() * 60)
      }
      break
    }

    case 'key': {
      if (!text) break
      const keyMap: Record<string, string> = {
        Return: 'Enter',
        Tab: 'Tab',
        BackSpace: 'Backspace',
        Escape: 'Escape',
        space: 'Space',
      }
      await page.keyboard.press(keyMap[text] ?? text)
      break
    }

    case 'scroll': {
      if (!coordinate) break
      const [x, y] = coordinate
      const delta = (amount ?? 3) * (direction === 'up' ? -100 : 100)
      await page.mouse.move(x, y)
      await page.mouse.wheel(0, delta)
      break
    }

    case 'left_click': {
      if (!coordinate) break
      await page.mouse.click(coordinate[0], coordinate[1])
      await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {})
      break
    }

    case 'left_click_drag': {
      if (!coordinate) break
      // Simple clic pour les cas courants
      await page.mouse.click(coordinate[0], coordinate[1])
      break
    }

    default:
      console.warn('[ETA Agent] Action non reconnue:', act)
  }
}

// ─── Prompt système ───────────────────────────────────────────────────────────

function buildSystemPrompt(traveler: Traveler): string {
  return `Tu es un agent IA spécialisé dans la soumission automatique de demandes ETA UK (Electronic Travel Authorisation) sur le portail officiel du Home Office britannique.

INFORMATIONS DU VOYAGEUR :
- Prénom(s) : ${traveler.prenom}
- Nom de famille : ${traveler.nom}
- Date de naissance : ${traveler.date_naissance} (format JJ/MM/AAAA)
- Lieu de naissance : ${traveler.lieu_naissance}
- Nationalité : ${traveler.nationalite}
- Numéro de passeport : ${traveler.num_passeport}
- Date d'expiration du passeport : ${traveler.expiry_passeport}
- Email de contact : ${traveler.email}
- Sexe : ${traveler.sexe}

CARTE BANCAIRE POUR LES FRAIS GOUVERNEMENTAUX (£10) :
- Numéro : ${process.env.COMPANY_CARD_NUMBER}
- Expiration : ${process.env.COMPANY_CARD_EXPIRY}
- CVC : ${process.env.COMPANY_CARD_CVC}
- Nom : ${process.env.COMPANY_CARD_NAME ?? 'ETA UK SERVICE'}

INSTRUCTIONS :
1. Navigue sur le portail ETA UK et commence une nouvelle demande
2. Réponds à toutes les questions en te basant sur les informations du voyageur
3. Pour les questions oui/non sur le casier judiciaire, les interdictions de territoire, les refus de visa : réponds TOUJOURS NON
4. Pour les questions de résidence au Royaume-Uni : réponds NON sauf indication contraire
5. Pour l'email, utilise l'email du voyageur fourni ci-dessus
6. Sois patient avec les temps de chargement des pages
7. Si une page ne charge pas, attends et réessaie
8. Si tu rencontres un CAPTCHA, décris-le précisément dans ton message texte

RÉPONSES FINALES :
- Si la demande est soumise avec succès, réponds exactement : DONE: [numéro_de_référence_ETA]
- Si tu détectes que l'ETA a été approuvée : DONE: [référence]
- En cas d'erreur bloquante : ERROR: [description_de_l_erreur]

L'outil computer te permet de voir des captures d'écran et d'interagir avec le navigateur.`
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
