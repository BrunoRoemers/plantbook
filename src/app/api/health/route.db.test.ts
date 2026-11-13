import { expect, test, vi } from 'vitest'

import { GET } from './route'

// connection() needs a Next.js request context; outside one there's nothing to defer.
vi.mock('next/server', () => ({ connection: async () => {} }))

test('reports the database version', async () => {
  const res = await GET()

  expect(res.status).toBe(200)
  expect(await res.json()).toMatchObject({
    database: 'ok',
    version: expect.stringMatching(/^PostgreSQL 18\./),
  })
})
