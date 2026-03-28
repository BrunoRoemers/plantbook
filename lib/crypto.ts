import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { z } from 'zod'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/*
 * Zod schemas
 */

const Base64 = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid base64')

const HexKey = z
  .string()
  .length(64, 'Encryption key must be 64 hex characters (32 bytes)')
  .regex(/^[0-9a-f]+$/i, 'Encryption key must be valid hex')

const EncryptedParts = z
  .string()
  .refine(
    (val) => {
      const parts = val.split(':')
      if (parts.length !== 4 || parts[0] !== 'encrypted') return false
      return (
        Base64.safeParse(parts[1]).success &&
        Base64.safeParse(parts[2]).success &&
        Base64.safeParse(parts[3]).success
      )
    },
    { message: 'Expected format encrypted:<iv>:<ciphertext>:<tag> (base64)' }
  )
  .transform((val) => {
    const [, iv, ciphertext, tag] = val.split(':')
    return {
      iv: Buffer.from(iv, 'base64'),
      ciphertext: Buffer.from(ciphertext, 'base64'),
      authTag: Buffer.from(tag, 'base64'),
    }
  })

/*
 * Branded types
 */

// Keys — prevent passing the wrong env var to the wrong operation
export const ServerEncryptionKeyHex = HexKey.brand('EncryptionKeyHex')
export type ServerEncryptionKeyHex = z.infer<typeof ServerEncryptionKeyHex>

export const SeederEncryptionKeyHex = HexKey.brand('SeederEncryptionKeyHex')
export type SeederEncryptionKeyHex = z.infer<typeof SeederEncryptionKeyHex>

// Ciphertext — prevent decrypting with the wrong key
export const ServerEncryptedValue = z.string().brand('ServerEncryptedValue')
export type ServerEncryptedValue = z.infer<typeof ServerEncryptedValue>

export const SeederEncryptedValue = z.string().brand('SeederEncryptedValue')
export type SeederEncryptedValue = z.infer<typeof SeederEncryptedValue>

// Plaintext secrets — prevent swapping seeder/nurturer secrets
export const SeederSecret = z.string().brand('SeederSecret')
export type SeederSecret = z.infer<typeof SeederSecret>

export const NurturerSecret = z.string().brand('NurturerSecret')
export type NurturerSecret = z.infer<typeof NurturerSecret>

/*
 * Key parsers — the only way to obtain branded keys
 */

export function parseEncryptionKey(raw: string): ServerEncryptionKeyHex {
  return ServerEncryptionKeyHex.parse(raw)
}

export function parseSeederEncryptionKey(raw: string): SeederEncryptionKeyHex {
  return SeederEncryptionKeyHex.parse(raw)
}

/*
 * Low-level encrypt/decrypt (unbranded, internal)
 */

export function rawEncrypt(plaintext: string, hexKey: string): string {
  const key = Buffer.from(HexKey.parse(hexKey), 'hex')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    'encrypted',
    iv.toString('base64'),
    encrypted.toString('base64'),
    authTag.toString('base64'),
  ].join(':')
}

export function rawDecrypt(encryptedValue: string, hexKey: string): string {
  const { iv, ciphertext, authTag } = EncryptedParts.parse(encryptedValue)
  const key = Buffer.from(HexKey.parse(hexKey), 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

  return decrypted.toString('utf8')
}

/*
 * Domain wrappers — server key (nurturer_email, nurturer_secret)
 */

export function encryptWithServerKey(
  plaintext: string,
  key: ServerEncryptionKeyHex
): ServerEncryptedValue {
  return rawEncrypt(plaintext, key) as ServerEncryptedValue
}

export function encryptNurturerSecret(
  secret: NurturerSecret,
  key: ServerEncryptionKeyHex
): ServerEncryptedValue {
  return rawEncrypt(secret, key) as ServerEncryptedValue
}

export function decryptWithServerKey(
  value: ServerEncryptedValue,
  key: ServerEncryptionKeyHex
): string {
  return rawDecrypt(value, key)
}

export function decryptNurturerSecret(
  value: ServerEncryptedValue,
  key: ServerEncryptionKeyHex
): NurturerSecret {
  return rawDecrypt(value, key) as NurturerSecret
}

/*
 * Domain wrappers — seeder key (seeder_secret)
 */

export function encryptSeederSecret(
  secret: SeederSecret,
  key: SeederEncryptionKeyHex
): SeederEncryptedValue {
  return rawEncrypt(secret, key) as SeederEncryptedValue
}

export function decryptSeederSecret(
  value: SeederEncryptedValue,
  key: SeederEncryptionKeyHex
): SeederSecret {
  return rawDecrypt(value, key) as SeederSecret
}

/*
 * Utilities
 */

export function isEncrypted(value: string): boolean {
  return EncryptedParts.safeParse(value).success
}
