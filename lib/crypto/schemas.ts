import { z } from 'zod'

export const Base64 = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid base64')
export type Base64 = z.infer<typeof Base64>

export const HexKey = z
  .string()
  .length(64, 'Encryption key must be 64 hex characters (32 bytes)')
  .regex(/^[0-9a-f]+$/i, 'Encryption key must be valid hex')
export type HexKey = z.infer<typeof HexKey>

export const EncryptedParts = z
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
export type EncryptedParts = z.infer<typeof EncryptedParts>

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
