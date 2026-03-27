# Agents Configuration

## Tech Stack & Tooling

- **Framework**: Next.js (App Router, TypeScript)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) — use shadcn components wherever possible for forms, buttons, cards, dialogs, etc.
- **Styling**: Tailwind CSS
- **Code Formatting**: Prettier (must be configured and all code must be formatted)
- **Testing**: Jest + React Testing Library

## Code Standards

- Write clean, maintainable, well-structured code
- All changes will be manually reviewed — keep PRs small and focused
- Follow existing patterns in the codebase
- Use TypeScript strict mode
- Run Prettier before committing
- Write tests for utilities and non-trivial logic
- Do not add unnecessary comments — code should be self-documenting

## Content

- Content lives in `content/` as markdown files with YAML frontmatter
- Tray and seed content is parsed with `gray-matter` and rendered with `next-mdx-remote/rsc`
- `@next/mdx` is configured for colocated `.mdx` pages in `app/`

## Security

- The repo is **public** — never commit plaintext secrets or email addresses
- Sensitive frontmatter fields (`nurturer_email`, `seeder_secret`, `nurturer_secret`) are encrypted with AES-256-GCM
- See `specs/PLAN.md` for the full encryption design
