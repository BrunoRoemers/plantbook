import { expect, test } from 'vitest'

import { auth } from '@/lib/auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

test('an anonymous sign-in creates an anonymous user with a UUID and a session', async () => {
  const { headers, response } = await auth.api.signInAnonymous({ returnHeaders: true })

  expect(response?.user.id).toMatch(UUID)

  const cookie = headers.get('set-cookie')!.split(';')[0]
  const session = await auth.api.getSession({ headers: new Headers({ cookie }) })

  expect(session?.user).toMatchObject({
    id: response?.user.id,
    isAnonymous: true,
    email: expect.stringMatching(/@anonymous\.placeholder\.invalid$/),
  })
})

test('email and password sign-up is disabled', async () => {
  await expect(
    auth.api.signUpEmail({ body: { email: 'gardener@example.com', password: 'tomatoes123', name: 'Gardener' } }),
  ).rejects.toThrow()
})
