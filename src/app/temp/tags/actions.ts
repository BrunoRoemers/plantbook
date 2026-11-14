'use server'

import { db } from '@/db'
import { tag } from '@/db/schema'
import { generateUnsafeSecret, hashTagSecret } from '@/lib/tag-secret'

/** Stores dev tag n (idempotent) and returns its secret. */
export async function generateUnsafeTag(n: number): Promise<{ secret: string }> {
  if (!Number.isInteger(n) || n < 1) throw new Error('n must be a positive integer')

  const secret = generateUnsafeSecret(n)
  await db.insert(tag).values({ secretHash: hashTagSecret(secret) }).onConflictDoNothing({ target: tag.secretHash })
  return { secret }
}
