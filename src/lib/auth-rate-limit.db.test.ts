import { afterEach, expect, test, vi } from 'vitest'

// IMPORTANT: Better Auth rate limits only apply to HTTP traffic, requests via their server-side API are NOT rate limited.

// Better Auth turns rate limiting on only when NODE_ENV is "production", and
// reads it once at import. So this file runs as production, before any import.
vi.hoisted(() => {
  vi.stubEnv('NODE_ENV', 'production')
})

const { auth } = await import('@/lib/auth')

afterEach(() => {
  vi.useRealTimers()
})

function signInAnonymouslyOverHttp(ip: string) {
  return auth.handler(
    new Request('http://localhost:3000/api/auth/sign-in/anonymous', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: '{}',
    }),
  )
}

test('in production, anonymous sign-ins over HTTP are limited to 3 per 10 seconds per IP', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })

  for (let i = 0; i < 3; i++) {
    expect((await signInAnonymouslyOverHttp('203.0.113.7')).status).toBe(200)
  }
  expect((await signInAnonymouslyOverHttp('203.0.113.7')).status).toBe(429)
  expect((await signInAnonymouslyOverHttp('198.51.100.2')).status).toBe(200)

  vi.advanceTimersByTime(10_000)
  expect((await signInAnonymouslyOverHttp('203.0.113.7')).status).toBe(200)
})
