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
