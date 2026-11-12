import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// One pool per function instance. On Vercel, attachDatabasePool keeps the
// function alive until idle clients are released; elsewhere it does nothing.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
attachDatabasePool(pool)

export const db = drizzle({ client: pool, casing: 'snake_case' })
export type Db = typeof db
