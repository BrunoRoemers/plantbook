import {
  EncryptedParts,
  HexKey,
  type SeederEncryptedValue,
  type ServerEncryptedValue,
} from '@/lib/crypto/schemas'
import { getSeederEncryptionKey, getServerEncryptionKey } from '@/lib/env'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

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

export function encryptWithServerKey(plaintext: string): ServerEncryptedValue {
  return rawEncrypt(plaintext, getServerEncryptionKey()) as ServerEncryptedValue
}

export function decryptWithServerKey(value: ServerEncryptedValue): string {
  return rawDecrypt(value, getServerEncryptionKey())
}

/*
 * Domain wrappers — seeder key (seeder_secret)
 */

export function encryptWithSeederKey(plaintext: string): SeederEncryptedValue {
  return rawEncrypt(plaintext, getSeederEncryptionKey()) as SeederEncryptedValue
}

export function decryptWithSeederKey(value: SeederEncryptedValue): string {
  return rawDecrypt(value, getSeederEncryptionKey())
}

/*
 * Utilities
 */

export function isEncrypted(value: string): boolean {
  return EncryptedParts.safeParse(value).success
}
