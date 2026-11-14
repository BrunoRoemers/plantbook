import { expect, test } from 'vitest'

import { db } from '@/db'
import { tag } from '@/db/schema'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

test('a tag stores only the hash of its secret, with a UUID and creation time', async () => {
  const [row] = await db.insert(tag).values({ secretHash: 'hash-1' }).returning()

  expect(row).toEqual({ id: expect.stringMatching(UUID), secretHash: 'hash-1', createdAt: expect.any(Date) })
})

test('two tags cannot share a secret hash', async () => {
  await db.insert(tag).values({ secretHash: 'hash-1' })

  await expect(db.insert(tag).values({ secretHash: 'hash-1' })).rejects.toThrow()
})
