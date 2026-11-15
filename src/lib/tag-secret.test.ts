import { expect, test } from 'vitest'

import { generateTagSecret, generateUnsafeSecret, hashTagSecret, SECRET_LENGTH } from './tag-secret'

const BASE36 = /^[0-9A-Z]+$/

test('a tag secret is 24 chars uppercase base36 by default, random each time', () => {
  const secret = generateTagSecret()

  expect(SECRET_LENGTH).toBe(24)
  expect(secret).toHaveLength(SECRET_LENGTH)
  expect(secret).toMatch(BASE36)
  expect(generateTagSecret()).not.toBe(secret)
  expect(generateTagSecret(40)).toHaveLength(40)
})

test('dev tag secrets are deterministic, differ per number, and shorter ones are prefixes of longer ones', () => {
  const secret = generateUnsafeSecret(1, 40)

  expect(secret).toMatch(BASE36)
  expect(generateUnsafeSecret(1, 40)).toBe(secret)
  expect(generateUnsafeSecret(1)).toBe(secret.slice(0, SECRET_LENGTH))
  expect(generateUnsafeSecret(2, 40)).not.toBe(secret)
})

test('hashing a secret is deterministic and does not contain the secret', () => {
  const secret = generateUnsafeSecret(1)

  expect(hashTagSecret(secret)).toBe(hashTagSecret(secret))
  expect(hashTagSecret(secret)).not.toContain(secret)
  expect(hashTagSecret(generateUnsafeSecret(2))).not.toBe(hashTagSecret(secret))
})
