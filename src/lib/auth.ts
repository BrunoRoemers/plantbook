import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { anonymous } from 'better-auth/plugins'

import { db } from '@/db'
import { getAuthSecret, getAuthUrl } from '@/lib/env'

export const auth = betterAuth({
  appName: 'PlantBook',
  secret: getAuthSecret(),
  baseURL: getAuthUrl(),
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: false },
  advanced: {
    database: { generateId: 'uuid' },
  },
  plugins: [
    anonymous(),
    // Must stay last, see: https://better-auth.com/docs/integrations/next
    nextCookies(),
  ],
})
