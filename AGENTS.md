<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Zod conventions

- Use **PascalCase** for Zod schemas (e.g. `const Cat = z.object({ ... })`).
- Declare the inferred type directly below the schema using the same name: `type Cat = z.infer<typeof Cat>;`
- Use Zod branded types where two similar primitives could be confused (e.g. two encryption keys, two secrets). See `lib/crypto.ts` for examples.

## Code style

- Use multi-line block comments (`/* ... */`) for file section headers, not `//` line comments.
- Never use `as` renames in exports — name things correctly at the declaration site.
- No hardcoded colors or magic values in TSX — pull from content (markdown frontmatter) or named constants in `lib/`.
- Tray numbers display without zero-padding in the UI (`#1`, not `#001`). Zero-padding is only for directory names (`content/trays/001/`).

## Content conventions

- Seed-specific data (name, description, color, etc.) lives in the seed markdown frontmatter (`content/seeds/*.md`), not in separate TypeScript mapping files.
- Tray data lives in `content/trays/{number}/index.md` with structured YAML frontmatter and MDX body for timeline updates.
- When adding per-seed or per-tray attributes, add them as frontmatter fields and read via `lib/seeds.ts` or `lib/trays.ts`.

## Build pipeline

- `npm run build` runs `prettier --check . && jest && next build`.
- Formatting and tests must pass before Vercel deploys. Don't bypass this.
