import { sql } from 'drizzle-orm'
import { connection } from 'next/server'

import { db } from '@/db'

// Proves the deployed app reaches its database.
// TEMP: remove once a real page reads from the database.
export async function GET() {
  await connection()
  const { rows } = await db.execute<{ version: string }>(sql`select version()`)
  return Response.json({ database: 'ok', version: rows[0].version })
}
