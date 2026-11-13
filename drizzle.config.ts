import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

import { getUnpooledDbUrl } from './src/lib/env'

loadEnvConfig(process.cwd())

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: { url: getUnpooledDbUrl() },
})
