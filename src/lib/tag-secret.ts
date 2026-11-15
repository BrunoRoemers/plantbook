import { createHash, randomInt } from 'node:crypto'

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** 24 chars base36 = 124.08 bits, and HTTPS://PB.POD.BRUSSELS/T/<secret> still fits QR version 4 at H. */
export const SECRET_LENGTH = 24

/** A new tag's secret: uppercase base36, case-insensitive. randomInt is cryptographically secure and unbiased. */
export function generateTagSecret(length = SECRET_LENGTH): string {
  return Array.from({ length }, () => BASE36[randomInt(BASE36.length)]).join('')
}

/** What we store for a tag: its secret is high-entropy, so a plain SHA-256 is enough. */
export function hashTagSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * Development only: the secret of dev tag n, the same on every machine and run, so anyone with this code
 * can compute it. Up to 49 chars; shorter secrets are prefixes of longer ones. Real tags use generateTagSecret.
 */
export function generateUnsafeSecret(n: number, length = SECRET_LENGTH): string {
  const hash = createHash('sha256').update(`plantbook-unsafe-tag:${n}`).digest('hex')
  return BigInt(`0x${hash}`).toString(36).toUpperCase().slice(0, length)
}
