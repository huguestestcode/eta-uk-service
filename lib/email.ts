import nodemailer from 'nodemailer'
import type { Traveler } from './db'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM = process.env.SMTP_FROM ?? 'ETA UK Service <noreply@eta-uk.fr>'

export async function sendPaymentConfirmation(
  to: string,
  orderId: string,
  numTravelers: number
): Promise<void> {
  const t = createTransport()
  await t.sendMail({
    from: FROM,
    to,
    subject: '✅ Paiement reçu – votre demande ETA UK est en cours',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto;color:#111827">
        <div style="background:#0f2167;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">ETA UK Service</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#0f2167;margin-top:0">Votre paiement a été accepté 🎉</h2>
          <p>Merci pour votre commande. Nous allons maintenant préparer votre formulaire d'identité.</p>
          <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0"><strong>Commande :</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p style="margin:6px 0 0"><strong>Voyageurs :</strong> ${numTravelers}</p>
          </div>
          <p>
            <strong>Prochaine étape :</strong> remplissez le formulaire d'identité pour chaque voyageur
            pour que notre agent IA puisse soumettre vos demandes auprès du Home Office britannique.
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px">
            ETA UK Service est un service privé indépendant du gouvernement britannique.<br>
            Des questions ? Répondez à cet email.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendETAResults(
  to: string,
  travelers: Traveler[]
): Promise<void> {
  const t = createTransport()

  const rows = travelers
    .map(
      (tv) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${tv.prenom} ${tv.nom}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${tv.eta_reference ?? '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:${tv.eta_status === 'approved' ? '#059669' : '#dc2626'}">
          ${tv.eta_status === 'approved' ? '✓ Approuvée' : '✗ Refusée'}
        </td>
      </tr>`
    )
    .join('')

  const allApproved = travelers.every((tv) => tv.eta_status === 'approved')

  await t.sendMail({
    from: FROM,
    to,
    subject: allApproved
      ? '✅ Votre ETA UK a été approuvée !'
      : '⚠️ Résultats de votre demande ETA UK',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto;color:#111827">
        <div style="background:#0f2167;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">ETA UK Service</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#0f2167;margin-top:0">Résultats de vos demandes ETA</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f0f4ff">
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280">VOYAGEUR</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280">RÉFÉRENCE ETA</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280">STATUT</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          ${
            allApproved
              ? `<div style="background:#ecfdf5;border-left:4px solid #059669;padding:14px 16px;border-radius:4px">
                  <p style="margin:0;color:#065f46">
                    <strong>Bonne nouvelle !</strong> Toutes les ETA ont été approuvées.
                    Elles sont liées électroniquement aux passeports – pas besoin de les imprimer.
                    Bon voyage au Royaume-Uni !
                  </p>
                </div>`
              : `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:4px">
                  <p style="margin:0;color:#991b1b">
                    Une ou plusieurs demandes ont été refusées. Notre équipe vous contactera
                    rapidement pour vous expliquer les raisons et les options disponibles.
                  </p>
                </div>`
          }
          <p style="color:#6b7280;font-size:13px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px">
            ETA UK Service est un service privé indépendant du gouvernement britannique.
          </p>
        </div>
      </div>
    `,
  })
}
