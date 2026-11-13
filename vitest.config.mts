import nextEnv from '@next/env'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// Load .env.test the way Next.js would (NODE_ENV is "test" under Vitest, so
// .env.local is skipped). Global setup and test workers inherit it.
nextEnv.loadEnvConfig(process.cwd())

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          exclude: [...configDefaults.exclude, 'e2e/**', '**/*.db.test.ts'],
        },
      },
      {
        // Integration tests against the local Postgres test database
        // (DATABASE_URL in .env.test). They share one database, so files run
        // one at a time.
        extends: true,
        test: {
          name: 'db',
          environment: 'node',
          include: ['**/*.db.test.ts'],
          exclude: [...configDefaults.exclude, 'e2e/**'],
          globalSetup: ['./src/test/db-global-setup.ts'],
          setupFiles: ['./src/test/db-setup.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
})
