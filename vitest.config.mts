import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

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
          setupFiles: ['./src/test/load-env.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
})
