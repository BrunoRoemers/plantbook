# Security

## Risks
- GitHub Actions received NEON_API_KEY to auto-clean database branches when a PR is closed, but that key has project-wide access. Neon doesn't provide more fine-grained controls.
- `/api/health` endpoint exposes runtime information.
- Better Auth has anonymous accounts enabled, but we're not sure that rate limits are already in place.
