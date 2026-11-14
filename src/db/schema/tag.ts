import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// A physical QR label. The secret lives only on the tag; we store its hash.
export const tag = pgTable('tag', {
  id: uuid()
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  secretHash: text().notNull().unique('tag_secret_hash_unique'),
  createdAt: timestamp().defaultNow().notNull(),
})
