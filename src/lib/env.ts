// The one place that reads environment variables. Getters validate on use, so
// a missing variable fails with a clear message where it's needed.

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set (see .env.example)`)
  return value
}

function url(name: string, value: string): string {
  if (!URL.canParse(value)) throw new Error(`${name} is not a valid URL`)
  return value
}

/** Pooled connection, for app queries. */
export const getPooledDbUrl = () => url('DATABASE_URL', required('DATABASE_URL'))

/** Direct connection, for migrations and other tools that need a session. */
export const getUnpooledDbUrl = () => url('DATABASE_URL_UNPOOLED', required('DATABASE_URL_UNPOOLED'))

export const getAuthSecret = () => required('BETTER_AUTH_SECRET')

/** Public origin of the app. Unset on Vercel previews: Better Auth then uses the request's origin. */
export const getAuthUrl = () => {
  const value = process.env.BETTER_AUTH_URL
  return value ? url('BETTER_AUTH_URL', value) : undefined
}
