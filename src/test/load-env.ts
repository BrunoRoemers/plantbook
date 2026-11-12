import { loadEnvConfig } from '@next/env'

// Load .env.test the way Next.js would (NODE_ENV is "test" under Vitest, so
// .env.local is skipped). Must run before anything imports '@/db'.
loadEnvConfig(process.cwd())
