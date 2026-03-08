import { NextResponse } from 'next/server'
import { initSchema } from '@/lib/db'

// Protect with a secret to avoid public access
export async function POST(req: Request) {
  const { secret } = await req.json()
  if (secret !== process.env.INIT_DB_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await initSchema()
  return NextResponse.json({ ok: true })
}
