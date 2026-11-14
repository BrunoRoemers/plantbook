import { expect, test } from 'vitest'

import { generateUnsafeSecret, hashTagSecret } from './tag-secret'

const BASE64URL_22 = /^[A-Za-z0-9_-]{22}$/

test('dev tag secrets are deterministic, 22 base64url chars, and differ per number', () => {
  expect(generateUnsafeSecret(1)).toMatch(BASE64URL_22)
  expect(generateUnsafeSecret(1)).toBe(generateUnsafeSecret(1))
  expect(generateUnsafeSecret(2)).not.toBe(generateUnsafeSecret(1))
})

test('hashing a secret is deterministic and does not contain the secret', () => {
  const secret = generateUnsafeSecret(1)

  expect(hashTagSecret(secret)).toBe(hashTagSecret(secret))
  expect(hashTagSecret(secret)).not.toContain(secret)
  expect(hashTagSecret(generateUnsafeSecret(2))).not.toBe(hashTagSecret(secret))
})
