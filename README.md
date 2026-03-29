## Getting Started

```bash
echo 'GIT_CLI_FALLBACK=true' >> .env.local
npm run dev
```

## Deployment

Several environment variables need to be configured. See `lib/env.ts`.

To generate valid secrets, run:

```bash
echo -e "SERVER_ENCRYPTION_KEY=$(openssl rand -hex 32)\nSEEDER_ENCRYPTION_KEY=$(openssl rand -hex 32)"
```
