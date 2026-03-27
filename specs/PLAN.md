# Plantbook - Implementation Plan

## Overview

Plantbook is a static web app hosted at **plantbook.pod.brussels** where people can request seed trays (egg cartons) and track plant growth over time. All content lives as markdown files in a git repo. The site is statically generated with Next.js on Vercel. Dynamic actions (form submissions, image uploads) go through Next.js server actions that commit directly to the GitHub repo via the GitHub API, triggering a Vercel rebuild.

**The repo is public.** All sensitive data (emails, secrets) must be encrypted before being committed.

## Terminology

- **Seeder**: The gardener (Bruno) who plants seeds in egg cartons
- **Nurturer**: The person who requests a tray and grows the plants
- **Tray**: A 2×6 (12-cell) egg carton, numbered sequentially (#001, #002, ...)
- **Seed**: A type of plant available in the catalog

## Architecture

```
Nurturer submits request form
  → Next.js server action
    → Encrypts email + secrets
    → GitHub API: commit tray markdown (with encrypted fields)
      → Vercel detects push → rebuilds static site (stripping encrypted fields from HTML)

Seeder/Nurturer posts update (with secret in URL)
  → Next.js server action
    → Validates secret (decrypt + compare)
    → Client-side compressed image uploaded as base64
    → GitHub API: append to tray markdown + commit images
      → Vercel detects push → rebuilds
```

No database. No object storage. The git repo **is** the database.

### GitHub API Commit Flow

To create a commit via GitHub API:
1. `GET /repos/{owner}/{repo}/git/ref/heads/main` — get current HEAD SHA
2. `GET /repos/{owner}/{repo}/git/commits/{sha}` — get the tree SHA
3. `POST /repos/{owner}/{repo}/git/blobs` — upload image(s) as base64 blobs
4. `POST /repos/{owner}/{repo}/git/trees` — create new tree with markdown file + image blobs
5. `POST /repos/{owner}/{repo}/git/commits` — create commit with new tree, parent = old HEAD
6. `PATCH /repos/{owner}/{repo}/git/ref/heads/main` — update HEAD to new commit

Race condition handling: if step 6 fails (someone else committed), retry from step 1 (once).

### Environment Variables (Vercel)

- `GITHUB_TOKEN` — Personal access token with repo write access
- `GITHUB_REPO` — e.g. `bruno/plantbook`
- `ENCRYPTION_KEY` — Server-only key for encrypting nurturer email and nurturer secret (AES-256-GCM, 32 bytes hex-encoded)
- `SEEDER_ENCRYPTION_KEY` — Shared key known by server AND Bruno's CLI, for encrypting seeder secret (AES-256-GCM, 32 bytes hex-encoded)

---

## Encryption Design

The repo is public. Three fields must never appear in plaintext:

| Field | Encrypted with | Who can decrypt |
|---|---|---|
| `nurturer_email` | `ENCRYPTION_KEY` | Server only |
| `nurturer_secret` | `ENCRYPTION_KEY` | Server only |
| `seeder_secret` | `SEEDER_ENCRYPTION_KEY` | Server + Bruno's CLI |

### Implementation

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key derivation**: Keys are provided as 32-byte hex-encoded env vars. No key derivation needed.
- **IV/Nonce**: Generate a random 12-byte IV per encryption. Store as `iv:ciphertext:authTag` (all base64-encoded) in the markdown frontmatter.
- **Library**: Node.js built-in `crypto` module (`crypto.createCipheriv` / `crypto.createDecipheriv`)

### Seeder CLI

A CLI script (`scripts/seeder-cli.ts`) that Bruno runs locally:

```bash
# Decrypt seeder secret for a tray and open the page
npx ts-node scripts/seeder-cli.ts open 42

# Just print the seeder secret
npx ts-node scripts/seeder-cli.ts secret 42
```

The CLI:
1. Reads `content/trays/042/index.md` from local git checkout
2. Decrypts `seeder_secret` using `SEEDER_ENCRYPTION_KEY` (from `.env.local` or env var)
3. Either prints the secret or opens `plantbook.pod.brussels/trays/42?secret=<decrypted>` in the browser

### Secret Validation Flow (server action)

When a request comes in with `?secret=xxx`:
1. Server action reads the tray's raw markdown from GitHub API
2. Decrypts `seeder_secret` with `SEEDER_ENCRYPTION_KEY` and compares
3. If no match, decrypts `nurturer_secret` with `ENCRYPTION_KEY` and compares
4. If match found, determines role (seeder vs nurturer) and allows the action

### QR Code Flow

When the seeder visits a tray page with the seeder secret in the URL:
- The page shows the normal tray view + update form
- **Additionally**, a "Print QR Code" button appears
- The QR code contains: `https://plantbook.pod.brussels/trays/{number}?secret={nurturer_secret}`
- To generate this: the server action decrypts the nurturer_secret (using `ENCRYPTION_KEY`) and returns it to the authenticated seeder so the QR code can be rendered client-side
- The seeder prints this QR code and sticks it on the physical egg carton before handing it to the nurturer

---

## Content Structure

```
content/
  seeds/
    tomato-cherry.md
    basil.md
    ...
  trays/
    001/
      index.md
      images/
        day-0-001.jpg
        day-5-001.jpg
        ...
    002/
      index.md
      images/
        ...
specs/
  tray.jpeg              ← Reference photo of a real 2×6 egg carton with soil (top-down view on wooden table)
```

### Seed Markdown (`content/seeds/tomato-cherry.md`)

```markdown
---
name: Cherry Tomato
description: Small, sweet tomatoes perfect for salads and snacking.
image: seed-packet.jpg
---

Optional longer description here.
```

### Tray Markdown (`content/trays/001/index.md`)

```markdown
---
number: 1
nurturer_name: Alice
nurturer_email: <encrypted:iv:ciphertext:tag>
seeder_secret: <encrypted:iv:ciphertext:tag>
nurturer_secret: <encrypted:iv:ciphertext:tag>
contribution_amount: 5
contribution_currency: EUR
cells_per_row: 6
cells:
  - tomato-cherry
  - tomato-cherry
  - basil
  - basil
  - parsley
  - parsley
  - mint
  - mint
  - chives
  - chives
  - oregano
  - oregano
created_at: 2026-04-01T12:00:00Z
---

## Day 0 — Seeds Requested

*Posted by nurturer on 2026-04-01*

I'd love a tray full of herbs and cherry tomatoes for my balcony garden!

## Day 3 — Planted!

*Posted by seeder on 2026-04-04*

All planted and watered. Keeping them under the grow light.

![Day 3 photo](images/day-3-001.jpg)

## Day 12 — Handover

*Posted by seeder on 2026-04-13*

Everything has sprouted nicely. Handing over to Alice today!

![Handover photo](images/day-12-001.jpg)
```

**At build time:** `nurturer_email`, `seeder_secret`, and `nurturer_secret` are stripped from the frontmatter before rendering to static HTML. They exist only in the git repo (encrypted) and are only decrypted server-side in server actions.

---

## Pages

### 1. Homepage (`/`)

- Gallery view of all trays, newest first
- Each tray shows: tray number, nurturer name, the egg carton grid visualization (2×6 cells colored/labeled by seed type), date created, latest update image (if any)
- Clicking a tray goes to its detail page

### 2. Tray Detail Page (`/trays/[number]`)

- Top: egg carton visualization showing what's planted in each cell
- Below: chronological timeline of all updates (day sections from the markdown)
- Each update shows: day label, who posted (seeder/nurturer), text, images
- **Without secret in URL**: read-only view
- **With nurturer secret in URL**: read-only view + "Add Update" form
- **With seeder secret in URL**: read-only view + "Add Update" form + "Print QR Code" button (QR contains nurturer secret URL for the egg carton sticker)

### 3. Request a Tray Page (`/request`)

The nurturer uses this page. No secrets are displayed after submission.

- Form fields:
  - Name (required)
  - Email (required)
  - 12 cell selectors (each is a dropdown of available seeds from the catalog, can select same seed multiple times, all cells must be filled)
  - Contribution amount (number input, minimum 0, pay what you want) + currency selector dropdown (EUR or CHT — Commons Hub Token, a community token for volunteering)
  - Optional message/note
- The egg carton visualization updates live as the user selects seeds
- On submit: server action assigns next tray number, generates two secrets (crypto.randomUUID), encrypts them, commits the tray markdown to GitHub
- Post-submission: confirmation page showing the tray URL (public, no secrets) and a thank-you message. The nurturer will receive their secret later when the seeder prints the QR code and sticks it on the carton.

### 4. Add Update (form on Tray Detail Page)

- Appears only when a valid secret is present in URL
- Form fields:
  - Title (e.g. "Sprouting!", "First harvest")
  - Day number (auto-calculated from creation date, editable)
  - Text content
  - Photo upload (optional, multiple)
- Client-side image compression before upload (target: ~500KB max per image, resize to max 1600px wide)
- On submit: server action validates secret, determines if seeder or nurturer, appends new markdown section to the tray's index.md, commits images, pushes to GitHub

---

## Tech Stack

- **Framework**: Next.js (App Router, static generation, server actions for dynamic parts)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Content Rendering**: `next-mdx-remote/rsc` for rendering MDX from `content/` directory + `gray-matter` for frontmatter parsing + remark/rehype plugins
- **MDX Support**: `@next/mdx` configured in `next.config.mjs` for any colocated `.mdx` pages in `app/`
- **Images**: Client-side compression via `browser-image-compression` (supports `maxSizeMB` targeting, Web Worker, EXIF handling)
- **QR Code**: `qrcode.react` or similar client-side QR library
- **GitHub Integration**: `@octokit/rest`
- **Encryption**: Node.js `crypto` (AES-256-GCM)
- **Testing**: Jest + React Testing Library
- **Code Formatting**: Prettier
- **Deployment**: Vercel (auto-deploy on push to main)
- **Domain**: plantbook.pod.brussels

### Why `next-mdx-remote/rsc` instead of `@next/mdx` for content?

`@next/mdx` is designed for MDX files **colocated inside `app/`** as route segments. It does not support:
- Dynamic loading of MDX from a `content/` directory
- Frontmatter parsing (requires additional remark plugins)
- `generateStaticParams`-based dynamic routes from a file listing

`next-mdx-remote/rsc` is the standard pattern for content-directory MDX in Next.js App Router:
- Works natively with React Server Components
- Pairs with `gray-matter` for frontmatter
- Supports remark/rehype plugin chains
- Content is read from filesystem at build time via `generateStaticParams`

`@next/mdx` is still installed and configured for any `.mdx` files that live directly in `app/` (e.g., an about page).

---

## Design Direction

- **Earthy, organic, rustic** — based on physical materials and the real world
- Reference photo: `specs/tray.jpeg` — a real 2×6 egg carton filled with soil, top-down view on a wooden table
- The egg carton visualization should be based on this photo: clean it up, use it as the base image, and overlay seed labels/indicators onto each cell
- Paper-textured backgrounds
- Typography: warm, readable, slightly rustic (e.g. a serif for headings, clean sans-serif for body)
- Color palette: browns, greens, cream/off-white, terracotta — derived from the tray photo's earthy tones
- The whole feel should be like looking at a gardener's worktable
- Responsive design (mobile-first)

---

## Implementation Phases

All work should be done in small, focused PRs that are easy to review.

### Phase 1: Project Scaffolding

1. Initialize Next.js project with App Router, Tailwind CSS, TypeScript
2. Configure Prettier
3. Configure Jest + React Testing Library
4. Install and configure shadcn/ui
5. Install `@next/mdx` and configure in `next.config.mjs`
6. Install `next-mdx-remote`, `gray-matter`, `remark-gfm`
7. Set up the `content/` directory structure with placeholder files
8. Create `AGENTS.md` at repo root

### Phase 2: Content Utilities & Encryption

9. Build encryption/decryption utilities (`lib/crypto.ts`) — AES-256-GCM encrypt/decrypt functions
10. Build seed catalog utilities (`lib/seeds.ts`) — list all seeds, get seed by slug
11. Build tray data utilities (`lib/trays.ts`) — list trays, get tray by number, get next tray number, parse frontmatter (stripping sensitive fields for public use)
12. Write tests for crypto and content utilities

### Phase 3: Static Pages

13. Build the homepage with tray gallery (read from `content/trays/`)
14. Build the egg carton grid component (2×6 grid, styled to match `specs/tray.jpeg`, cells colored/labeled by seed type)
15. Build the tray detail page with timeline view (render MDX body via `next-mdx-remote/rsc`)
16. Apply the earthy/organic design system (colors, typography, textures, layout)
17. Create empty states (no trays yet, no seeds yet)

### Phase 4: GitHub API Integration

18. Build the GitHub API commit utility (`lib/github.ts`) — create blobs, trees, commits, update ref, with retry on race condition
19. Write tests for GitHub commit utility (mocked)

### Phase 5: Request Flow

20. Build the "Request a Tray" form page (`/request`) with live egg carton preview
21. Build the server action for tray request submission:
    - Validate form data
    - Determine next tray number
    - Generate seeder_secret and nurturer_secret (`crypto.randomUUID`)
    - Encrypt email with `ENCRYPTION_KEY`
    - Encrypt nurturer_secret with `ENCRYPTION_KEY`
    - Encrypt seeder_secret with `SEEDER_ENCRYPTION_KEY`
    - Create the tray markdown file
    - Commit to GitHub via API
    - Return tray URL (public, no secrets displayed)
22. Build the post-submission confirmation page

### Phase 6: Update Flow

23. Build the update form component (shown when valid secret is in URL)
24. Implement client-side image compression (`browser-image-compression`)
25. Build the server action for posting updates:
    - Read raw tray markdown from GitHub API
    - Decrypt and validate secret → determine role
    - Compress and upload image blobs to GitHub
    - Append new markdown section to tray's `index.md`
    - Commit and push
26. Build the QR code print feature (visible only to seeder):
    - Server action that, given a valid seeder secret, decrypts and returns the nurturer secret
    - Client renders QR code with nurturer URL
    - Print-friendly layout for the QR sticker

### Phase 7: Seeder CLI

27. Build `scripts/seeder-cli.ts`:
    - `open <tray-number>` — decrypt seeder secret from local file, open browser to tray page with secret
    - `secret <tray-number>` — print decrypted seeder secret
    - Reads `SEEDER_ENCRYPTION_KEY` from `.env.local` or environment
    - Reads tray file from local `content/trays/{number}/index.md`

### Phase 8: Polish & Deploy

28. Responsive design pass
29. Error handling for GitHub API failures (retry, user-friendly messages)
30. Loading states for form submissions
31. Meta tags / OpenGraph for tray sharing
32. Set up Vercel project and environment variables
33. Configure custom domain (plantbook.pod.brussels)
34. Honeypot or basic spam protection on forms

---

## Security Considerations

- **Public repo**: All sensitive data (email, secrets) is encrypted with AES-256-GCM before being committed. Plaintext never touches the repo.
- **Two encryption keys**: `ENCRYPTION_KEY` (server-only, protects nurturer data) and `SEEDER_ENCRYPTION_KEY` (server + Bruno CLI, protects seeder access)
- **Build-time stripping**: Encrypted fields are excluded from static HTML output. Even the encrypted ciphertext is not exposed to the public site.
- **Secret validation**: Server actions decrypt secrets server-side to validate. Secrets are never compared in plaintext on the client.
- **GitHub token**: Stored as Vercel env var, never exposed to client.
- **Image validation**: Server action validates file type and size before committing.
- **Spam protection**: Honeypot field on forms.

## Open Questions / Future Considerations

- Seed catalog will be populated manually by Bruno
- Future: Neon DB + GCS as intermediate queue if GitHub API becomes a bottleneck
- Future: different tray sizes beyond 2×6
- Future: search/filtering on homepage
- Future: proper authentication if the trust model needs to change
