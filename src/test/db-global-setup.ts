import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Client } from 'pg'

import { getUnpooledDbUrl } from '@/lib/env'

// Runs once, in Vitest's main process, before the db test files: brings the
// test database up to date over a single direct connection.
export default async function setup() {
  const client = new Client({ connectionString: getUnpooledDbUrl() })
  try {
    await client.connect()
    await migrate(drizzle({ client }), { migrationsFolder: './drizzle' })
  } catch (error) {
    throw new Error('Could not migrate the test database. Is Postgres running? See README → Database.', {
      cause: error,
    })
  } finally {
    await client.end()
  }
}
