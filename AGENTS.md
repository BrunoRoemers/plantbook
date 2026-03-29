<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Zod conventions

- Use **PascalCase** for Zod schemas (e.g. `const Cat = z.object({ ... })`).
- Declare the inferred type directly below the schema using the same name: `type Cat = z.infer<typeof Cat>;`
- Use Zod branded types where two similar primitives could be confused (e.g. two encryption keys, two secrets). See `lib/crypto/schemas.ts` for examples.

## Module structure

Each concern (crypto, git, env, etc.) gets its own folder under `lib/` so it can contain multiple files. `index.ts` provides a clean import path (e.g. `@/lib/crypto`) but is **not a barrel export** — it doesn't re-export from sibling files. Consumers import from whichever file has what they need.

Current examples: `lib/crypto/`, `lib/git/github/`.

## Icons

- Always use [Lucide React](https://lucide.dev/) (`lucide-react`) for icons. Don't inline SVGs or use other icon libraries.

## Code style

- Use multi-line block comments (`/* ... */`) for file section headers, not `//` line comments.
- Never use `as` renames in exports — name things correctly at the declaration site.
- No separate `export { ... }` statements or re-exports — put the `export` keyword directly on the declaration.
- No hardcoded colors or magic values in TSX — pull from content (markdown frontmatter) or named constants in `lib/`.
- Tray numbers display without zero-padding in the UI (`#1`, not `#001`). Zero-padding is only for directory names (`content/trays/001/`).
- Avoid `as` type casts if possible — write types that are correct so casts aren't needed.
- Propagate branded types through function signatures — don't widen. If a function accepts an encrypted value, type it as `ServerEncryptedValue`, not `string`.

## Content conventions

- Seed-specific data (name, description, color, etc.) lives in the seed markdown frontmatter (`content/seeds/*.md`), not in separate TypeScript mapping files.
- Tray data lives in `content/trays/{number}/index.md` with structured YAML frontmatter and MDX body for timeline updates.
- When adding per-seed or per-tray attributes, add them as frontmatter fields and read via `lib/seeds.ts` or `lib/trays.ts`.

## Build pipeline

- `npm run build` runs `prettier --check . && jest && next build`.
- Formatting and tests must pass before Vercel deploys. Don't bypass this.
- **Sandbox limitation:** `next build` (and `tsc`) crash in the Claude Code sandbox due to SWC native binary incompatibility with the emulated ARM64 CPU. The `@next/swc-linux-arm64-gnu` binary segfaults on load. This is a platform issue, not a code issue. Prettier and Jest still work. Verify `next build` on the host machine or let Vercel run it.
