import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { getPooledDbUrl } from '@/lib/env'

import * as schema from './schema'

// One pool per function instance. On Vercel, attachDatabasePool keeps the
// function alive until idle clients are released; elsewhere it does nothing.
export const pool = new Pool({ connectionString: getPooledDbUrl() })
attachDatabasePool(pool)

// The schema enables db.query and lets Better Auth's adapter find its tables.
export const db = drizzle({ client: pool, schema, casing: 'snake_case' })
export type Db = typeof db
