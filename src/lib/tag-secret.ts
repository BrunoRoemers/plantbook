import { createHash } from 'node:crypto'

/** What we store for a tag: its secret is high-entropy, so a plain SHA-256 is enough. */
export function hashTagSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * Development only: the secret of dev tag n, the same on every machine and run.
 * 128 bits as 22 chars base64url, like a real secret (decision 001). Guessable by anyone who has this code.
 */
export function generateUnsafeSecret(n: number): string {
  return createHash('sha256').update(`plantbook-unsafe-tag:${n}`).digest().subarray(0, 16).toString('base64url')
}
