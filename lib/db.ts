import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const DB_PATH = path.join(process.cwd(), 'data', 'eta.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id                      TEXT PRIMARY KEY,
      email                   TEXT NOT NULL,
      num_travelers           INTEGER NOT NULL,
      amount_paid             INTEGER NOT NULL DEFAULT 0,
      stripe_session_id       TEXT UNIQUE,
      stripe_payment_intent   TEXT,
      status                  TEXT NOT NULL DEFAULT 'pending_payment',
      created_at              TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

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

// ─── Orders ─────────────────────────────────────────────────────────────────

export function createOrder(
  email: string,
  numTravelers: number,
  stripeSessionId: string
): Order {
  const db = getDb()
  const id = uuidv4()
  db.prepare(
    `INSERT INTO orders (id, email, num_travelers, stripe_session_id)
     VALUES (?, ?, ?, ?)`
  ).run(id, email, numTravelers, stripeSessionId)
  return getOrder(id)!
}

export function getOrder(id: string): Order | null {
  return getDb()
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(id) as Order | null
}

export function getOrderBySessionId(sessionId: string): Order | null {
  return getDb()
    .prepare('SELECT * FROM orders WHERE stripe_session_id = ?')
    .get(sessionId) as Order | null
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra: { amount_paid?: number; stripe_payment_intent?: string } = {}
): void {
  const db = getDb()
  const sets: string[] = ["status = ?", "updated_at = datetime('now')"]
  const vals: unknown[] = [status]

  if (extra.amount_paid !== undefined) {
    sets.push('amount_paid = ?')
    vals.push(extra.amount_paid)
  }
  if (extra.stripe_payment_intent !== undefined) {
    sets.push('stripe_payment_intent = ?')
    vals.push(extra.stripe_payment_intent)
  }

  vals.push(id)
  db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}

// ─── Travelers ───────────────────────────────────────────────────────────────

export function initTravelers(orderId: string, count: number): Traveler[] {
  const db = getDb()
  const travelers: Traveler[] = []
  for (let i = 0; i < count; i++) {
    const id = uuidv4()
    db.prepare('INSERT INTO travelers (id, order_id) VALUES (?, ?)').run(
      id,
      orderId
    )
    travelers.push(
      db.prepare('SELECT * FROM travelers WHERE id = ?').get(id) as Traveler
    )
  }
  return travelers
}

export function getTravelersByOrder(orderId: string): Traveler[] {
  return getDb()
    .prepare('SELECT * FROM travelers WHERE order_id = ? ORDER BY created_at')
    .all(orderId) as Traveler[]
}

export function updateTraveler(
  id: string,
  data: Partial<Omit<Traveler, 'id' | 'order_id' | 'created_at' | 'updated_at'>>
): void {
  const db = getDb()
  const allowed = [
    'prenom', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite',
    'num_passeport', 'expiry_passeport', 'email', 'sexe',
    'eta_reference', 'eta_status', 'eta_error',
  ]

  const sets: string[] = ["updated_at = datetime('now')"]
  const vals: unknown[] = []

  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key) && value !== undefined) {
      sets.push(`${key} = ?`)
      vals.push(value)
    }
  }

  vals.push(id)
  db.prepare(`UPDATE travelers SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}
