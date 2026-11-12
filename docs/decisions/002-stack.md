# 002: Stack

Status: **accepted** (2026-11-12)

Already in place: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn on Base UI, deployed on Vercel.

| Concern | Choice | Why |
|---|---|---|
| Database | Postgres | The [domain model](../domain-model.md) relies on partial unique indexes and exclusion constraints on time ranges (`btree_gist`). |
| Database host | Neon free tier, via the Vercel Marketplace | Scales to zero instead of pausing; a database branch per preview deployment; supports `btree_gist`. |
| Local database | Postgres.app on the Mac; anything in the sandbox. No Docker. | Postgres 18, Neon's default. |
| Driver | `pg` with a pool, `attachDatabasePool` on Vercel | Neon's advice for Vercel Fluid compute. Same driver locally and in production. |
| Data access | Drizzle ORM + drizzle-kit | Types from the TypeScript schema, no codegen step, official Better Auth adapter. Exclusion constraints go in custom SQL migrations. |
| Migrations | `drizzle-kit migrate` on the unpooled URL, during the Vercel build | Each preview's database branch is migrated before it deploys. |
| Auth | Better Auth, passwordless (email OTP / magic link), Drizzle adapter, UUID ids | Accounts stay optional. Its `user` table is the domain model's `user`. |
| Email | Resend | Free tier. Logs to the console in development. |
| Photo storage | Probably Google Cloud Storage | Generous free tier. Decided when a spec needs it. |
| Unit and integration tests | Vitest + Testing Library; integration tests against a local test database | Fast, native TypeScript and ESM, covered by the Next.js docs. |
| End-to-end tests | `@playwright/test`, phone viewport | The scan flow is a phone flow. |
| Quality gate | `npm run check` = typecheck + lint + Vitest | One command defines "done". |
