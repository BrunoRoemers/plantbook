# 002: Stack

Status: **accepted** (2026-11-12), except data access (open)

Already in place: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn on Base UI, deployed on Vercel.

| Concern | Choice | Why |
|---|---|---|
| Database | Postgres | The [domain model](../domain-model.md) relies on partial unique indexes and exclusion constraints on time ranges (`btree_gist`). |
| Database host | Neon free tier, via the Vercel Marketplace | Scales to zero instead of pausing; a database branch per preview deployment; supports `btree_gist`. |
| Local database | Postgres.app on the Mac; anything in the sandbox. No Docker. | Postgres 18, Neon's default. |
| Data access | TBD | |
| Auth | Better Auth, passwordless | Accounts stay optional; magic link or email code. |
| Photo storage | Probably Google Cloud Storage | Generous free tier. Decided when a spec needs it. |
| Unit and integration tests | Vitest + Testing Library | Fast, native TypeScript and ESM, covered by the Next.js docs. |
| End-to-end tests | `@playwright/test`, phone viewport | The scan flow is a phone flow. |
| Quality gate | `npm run check` = typecheck + lint + Vitest | One command defines "done". |
