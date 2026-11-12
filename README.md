# PlantBook

PlantBook connects gardeners through the plants they grow and give away: QR tags on spots, plant timelines, gifting.

How we work, commands and conventions: [`.claude/CLAUDE.md`](CLAUDE.md). Domain model, decisions and specs: [`docs/`](docs/).

```bash
npm install
npm run dev # http://localhost:3000
```

## Database

Postgres 18 everywhere: [Neon](https://neon.com) in production and previews, Postgres.app on the Mac.

### Local (Mac)

1. Install [Postgres.app](https://postgresapp.com) and initialize a **PostgreSQL 18** server.
2. Create the database:
   ```bash
   psql -c "CREATE ROLE plantbook LOGIN PASSWORD 'plantbook';"
   psql -c "CREATE DATABASE plantbook OWNER plantbook;"
   psql -c "CREATE DATABASE plantbook_test OWNER plantbook;" # for `npm test`
   ```
3. `cp .env.example .env.local`.
