import { sql, db } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'identity_submitted'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

export interface Order {
  id: string
  email: string
  num_travelers: number
  amount_paid: number
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface Traveler {
  id: string
  order_id: string
  prenom: string | null
  nom: string | null
  date_naissance: string | null
  lieu_naissance: string | null
  nationalite: string | null
  num_passeport: string | null
  expiry_passeport: string | null
  email: string | null
  sexe: string | null
  eta_reference: string | null
  eta_status: string
  eta_error: string | null
  created_at: string
  updated_at: string
}

// ─── Schema ──────────────────────────────────────────────────────────────────

export async function initSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id                      TEXT PRIMARY KEY,
      email                   TEXT NOT NULL,
      num_travelers           INTEGER NOT NULL,
      amount_paid             INTEGER NOT NULL DEFAULT 0,
      stripe_session_id       TEXT UNIQUE,
      stripe_payment_intent   TEXT,
      status                  TEXT NOT NULL DEFAULT 'pending_payment',
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS travelers (
      id                TEXT PRIMARY KEY,
      order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      prenom            TEXT,
      nom               TEXT,
      date_naissance    TEXT,
      lieu_naissance    TEXT,
      nationalite       TEXT,
      num_passeport     TEXT,
      expiry_passeport  TEXT,
      email             TEXT,
      sexe              TEXT,
      eta_reference     TEXT,
      eta_status        TEXT NOT NULL DEFAULT 'pending',
      eta_error         TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function createOrder(
  email: string,
  numTravelers: number,
  stripeSessionId: string,
  status: OrderStatus = 'pending_payment'
): Promise<Order> {
  const id = uuidv4()
  await sql`
    INSERT INTO orders (id, email, num_travelers, stripe_session_id, status)
    VALUES (${id}, ${email}, ${numTravelers}, ${stripeSessionId}, ${status})
  `
  return (await getOrder(id))!
}

export interface TravelerInput {
  prenom: string
  nom: string
  date_naissance: string
  lieu_naissance: string
  nationalite: string
  num_passeport: string
  expiry_passeport: string
  email: string
  sexe: string
}

export async function insertTravelers(
  orderId: string,
  travelers: TravelerInput[]
): Promise<void> {
  for (const t of travelers) {
    const id = uuidv4()
    await sql`
      INSERT INTO travelers
        (id, order_id, prenom, nom, date_naissance, lieu_naissance,
         nationalite, num_passeport, expiry_passeport, email, sexe, eta_status)
      VALUES
        (${id}, ${orderId},
         ${t.prenom.trim().toUpperCase()},
         ${t.nom.trim().toUpperCase()},
         ${t.date_naissance},
         ${t.lieu_naissance?.trim() ?? null},
         ${t.nationalite},
         ${t.num_passeport.trim().toUpperCase().replace(/\s/g, '')},
         ${t.expiry_passeport},
         ${t.email.trim().toLowerCase()},
         ${t.sexe},
         'pending')
    `
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const { rows } = await sql`SELECT * FROM orders WHERE id = ${id}`
  return (rows[0] as Order) ?? null
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { rows } = await sql`SELECT * FROM orders WHERE stripe_session_id = ${sessionId}`
  return (rows[0] as Order) ?? null
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra: { amount_paid?: number; stripe_payment_intent?: string } = {}
): Promise<void> {
  if (extra.amount_paid !== undefined && extra.stripe_payment_intent !== undefined) {
    await sql`
      UPDATE orders
      SET status = ${status},
          amount_paid = ${extra.amount_paid},
          stripe_payment_intent = ${extra.stripe_payment_intent},
          updated_at = NOW()
      WHERE id = ${id}
    `
  } else if (extra.amount_paid !== undefined) {
    await sql`
      UPDATE orders
      SET status = ${status}, amount_paid = ${extra.amount_paid}, updated_at = NOW()
      WHERE id = ${id}
    `
  } else if (extra.stripe_payment_intent !== undefined) {
    await sql`
      UPDATE orders
      SET status = ${status}, stripe_payment_intent = ${extra.stripe_payment_intent}, updated_at = NOW()
      WHERE id = ${id}
    `
  } else {
    await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
  }
}

// ─── Travelers ───────────────────────────────────────────────────────────────

export async function initTravelers(orderId: string, count: number): Promise<Traveler[]> {
  const travelers: Traveler[] = []
  for (let i = 0; i < count; i++) {
    const id = uuidv4()
    await sql`INSERT INTO travelers (id, order_id) VALUES (${id}, ${orderId})`
    const { rows } = await sql`SELECT * FROM travelers WHERE id = ${id}`
    travelers.push(rows[0] as Traveler)
  }
  return travelers
}

export async function getTravelersByOrder(orderId: string): Promise<Traveler[]> {
  const { rows } = await sql`
    SELECT * FROM travelers WHERE order_id = ${orderId} ORDER BY created_at
  `
  return rows as Traveler[]
}

export async function updateTraveler(
  id: string,
  data: Partial<Omit<Traveler, 'id' | 'order_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const allowed = [
    'prenom', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite',
    'num_passeport', 'expiry_passeport', 'email', 'sexe',
    'eta_reference', 'eta_status', 'eta_error',
  ]

  const sets: string[] = ['updated_at = NOW()']
  const vals: unknown[] = []
  let paramIdx = 1

  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key) && value !== undefined) {
      sets.push(`${key} = $${paramIdx}`)
      vals.push(value)
      paramIdx++
    }
  }

  vals.push(id)
  await db.query(
    `UPDATE travelers SET ${sets.join(', ')} WHERE id = $${paramIdx}`,
    vals
  )
}
