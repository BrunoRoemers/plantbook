'use server'

import { db } from '@/db'
import { tag } from '@/db/schema'
import { generateUnsafeSecret, hashTagSecret, SECRET_LENGTH } from '@/lib/tag-secret'

/** Stores dev tag n (idempotent) and returns its secret at the given length. Only the first SECRET_LENGTH chars count. */
export async function generateUnsafeTag(n: number, length: number): Promise<string> {
  if (!Number.isInteger(n) || n < 1) throw new Error('n must be a positive integer')
  if (!Number.isInteger(length) || length < SECRET_LENGTH) throw new Error(`length must be at least ${SECRET_LENGTH}`)

  const secret = generateUnsafeSecret(n, length)
  await db
    .insert(tag)
    .values({ secretHash: hashTagSecret(secret.slice(0, SECRET_LENGTH)) })
    .onConflictDoNothing({ target: tag.secretHash })
  return secret
}
