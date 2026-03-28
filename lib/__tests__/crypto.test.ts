import { isEncrypted, rawDecrypt, rawEncrypt } from '@/lib/crypto'
import { randomBytes } from 'crypto'

const TEST_KEY = randomBytes(32).toString('hex')

describe('crypto', () => {
  describe('encrypt/decrypt', () => {
    it('round-trips a simple string', () => {
      const plaintext = 'hello@example.com'
      const encrypted = rawEncrypt(plaintext, TEST_KEY)
      expect(rawDecrypt(encrypted, TEST_KEY)).toBe(plaintext)
    })

    it('round-trips unicode content', () => {
      const plaintext = 'Ça va bien 🌱'
      const encrypted = rawEncrypt(plaintext, TEST_KEY)
      expect(rawDecrypt(encrypted, TEST_KEY)).toBe(plaintext)
    })

    it('round-trips an empty string', () => {
      const encrypted = rawEncrypt('', TEST_KEY)
      expect(rawDecrypt(encrypted, TEST_KEY)).toBe('')
    })

    it('produces different ciphertexts for the same input (random IV)', () => {
      const a = rawEncrypt('same', TEST_KEY)
      const b = rawEncrypt('same', TEST_KEY)
      expect(a).not.toBe(b)
    })

    it('produces the encrypted:iv:ciphertext:tag format', () => {
      const encrypted = rawEncrypt('test', TEST_KEY)
      const parts = encrypted.split(':')
      expect(parts).toHaveLength(4)
      expect(parts[0]).toBe('encrypted')
    })
  })

  describe('decrypt errors', () => {
    it('throws on wrong key', () => {
      const otherKey = randomBytes(32).toString('hex')
      const encrypted = rawEncrypt('secret', TEST_KEY)
      expect(() => rawDecrypt(encrypted, otherKey)).toThrow()
    })

    it('throws on tampered ciphertext', () => {
      const encrypted = rawEncrypt('secret', TEST_KEY)
      const parts = encrypted.split(':')
      parts[2] = Buffer.from('tampered').toString('base64')
      expect(() => rawDecrypt(parts.join(':'), TEST_KEY)).toThrow()
    })

    it('throws on invalid format', () => {
      expect(() => rawDecrypt('not-encrypted', TEST_KEY)).toThrow()
    })

    it('throws on invalid key length', () => {
      expect(() => rawEncrypt('test', 'tooshort')).toThrow()
    })

    it('throws on non-hex key', () => {
      const nonHex = 'zz'.repeat(32)
      expect(() => rawEncrypt('test', nonHex)).toThrow()
    })

    it('throws on invalid base64 segments', () => {
      expect(() => rawDecrypt('encrypted:!!!:!!!:!!!', TEST_KEY)).toThrow()
    })
  })

  describe('isEncrypted', () => {
    it('returns true for encrypted values', () => {
      const encrypted = rawEncrypt('test', TEST_KEY)
      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('returns false for plain strings', () => {
      expect(isEncrypted('hello')).toBe(false)
      expect(isEncrypted('encrypted')).toBe(false)
      expect(isEncrypted('a:b:c')).toBe(false)
    })
  })
})
