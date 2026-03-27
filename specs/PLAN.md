# Plantbook - Implementation Plan

## Overview

Plantbook is a static web app hosted at **plantbook.pod.brussels** where people can request seed trays (egg cartons) and track plant growth over time. All content lives as markdown files in a git repo. The site is statically generated with Next.js on Vercel. Dynamic actions (form submissions, image uploads) go through Next.js server actions that commit directly to the GitHub repo via the GitHub API, triggering a Vercel rebuild.

## Terminology

- **Seeder**: The gardener (Bruno) who plants seeds in egg cartons
- **Nurturer**: The person who requests a tray and grows the plants
- **Tray**: A 2×6 (12-cell) egg carton, numbered sequentially (#001, #002, ...)
- **Seed**: A type of plant available in the catalog

## Architecture

```
User submits form
  → Next.js server action
    → Client-side compressed image (already small)
    → GitHub API: create blob(s) + commit markdown + images
      → Vercel detects push → rebuilds static site
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
nurturer_email: alice@example.com
seeder_secret: abc123
nurturer_secret: def456
contribution: 5
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

**Note:** `nurturer_email`, `seeder_secret`, and `nurturer_secret` are in the markdown frontmatter but must be **stripped out** at build time so they don't appear on the public site. The static page never contains secrets or email. The server action reads the raw file from GitHub API to validate secrets.

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
- If `?secret=xxx` is in the URL and matches either seeder_secret or nurturer_secret, show an "Add Update" form at the top

### 3. Request a Tray Page (`/request`)

- Form fields:
  - Name (required)
  - Email (required)
  - 12 cell selectors (each is a dropdown of available seeds from the catalog, can select same seed multiple times, all cells must be filled)
  - Contribution amount (number input, minimum 0, pay what you want)
  - Optional message/note
- The egg carton visualization updates live as the user selects seeds
- Client-side image compression is not needed here (no image upload on request)
- On submit: server action assigns next tray number, generates two secrets (seeder + nurturer), commits the tray markdown to GitHub, returns the tray URL

### 4. Add Update (form on Tray Detail Page)

- Appears only when valid `?secret=xxx` is present in URL
- Form fields:
  - Title (e.g. "Sprouting!", "First harvest")
  - Day number (auto-calculated from creation date, editable)
  - Text content
  - Photo upload (optional, multiple)
- Client-side image compression before upload (target: ~500KB max per image, resize to max 1600px wide)
- On submit: server action validates secret, determines if seeder or nurturer, appends new section to the tray's index.md, commits images, pushes to GitHub

---

## Tech Stack

- **Framework**: Next.js (App Router, static export where possible, server actions for dynamic parts)
- **Styling**: Tailwind CSS
- **Content**: Markdown files with gray-matter for frontmatter parsing, remark/rehype for rendering
- **Images**: Client-side compression via browser-image-compression library
- **GitHub Integration**: @octokit/rest (official GitHub API client)
- **Deployment**: Vercel (auto-deploy on push to main)
- **Domain**: plantbook.pod.brussels

---

## Design Direction

- **Earthy, organic, rustic** — based on physical materials
- Paper-textured backgrounds
- The egg carton visualization should be based on a real egg carton image (Bruno will provide a photo to use as the base)
- Seed cells drawn/overlaid onto the egg carton image
- Typography: warm, readable, slightly rustic (e.g. a serif for headings, clean sans for body)
- Color palette: browns, greens, cream/off-white, terracotta
- The whole feel should be like looking at a gardener's worktable
- Responsive design (mobile-first)

---

## Implementation Phases

### Phase 1: Project Setup & Content Foundation

1. Initialize Next.js project with App Router and Tailwind CSS
2. Set up the `content/` directory structure
3. Create a few placeholder seed markdown files for development
4. Build the markdown parsing utilities (gray-matter + remark/rehype)
5. Build the tray data reading utilities (list trays, get tray by number, get next tray number)
6. Build the seed catalog reading utilities

### Phase 2: Static Pages

7. Build the homepage with tray gallery (read from content/trays/)
8. Build the egg carton grid component (2×6 grid, colored cells by seed type, with labels)
9. Build the tray detail page with timeline view
10. Build the seed catalog display (used in the request form)
11. Apply the earthy/organic design system (colors, typography, textures, layout)

### Phase 3: Request Flow

12. Build the "Request a Tray" form page with live egg carton preview
13. Implement the GitHub API commit utility (create blobs, trees, commits, update ref)
14. Build the server action for tray request submission:
    - Validate form data
    - Determine next tray number (read content/trays/ via GitHub API or at build time)
    - Generate seeder_secret and nurturer_secret (crypto.randomUUID or similar)
    - Create the tray markdown file
    - Commit to GitHub via API
    - Return tray URL + secrets (display once to the user)
15. Handle the post-submission page showing the tray URL, seeder QR code link, and nurturer QR code link

### Phase 4: Update Flow

16. Build the update form component (shown when secret is in URL)
17. Implement client-side image compression
18. Build the server action for posting updates:
    - Validate secret against tray's seeder_secret or nurturer_secret (read raw file from GitHub API)
    - Determine poster role (seeder vs nurturer)
    - Upload image blobs to GitHub
    - Append new markdown section to tray's index.md
    - Commit and push
19. Show success state after posting an update

### Phase 5: Polish & Deploy

20. Responsive design pass (test on mobile)
21. Error handling for GitHub API failures (retry logic, user-friendly error messages)
22. Loading states for form submissions
23. Meta tags / OpenGraph for tray sharing
24. Set up Vercel project and environment variables
25. Configure custom domain (plantbook.pod.brussels)
26. Create a placeholder/empty state for when there are no trays yet

---

## Security Considerations

- Secrets (seeder_secret, nurturer_secret) and email are stored in markdown frontmatter but **stripped at build time** — they never appear in the static HTML
- Server actions read the raw markdown from GitHub API to validate secrets (not from the static build)
- GitHub token is stored as a Vercel environment variable, never exposed to the client
- Image uploads are compressed client-side; server action should validate file type and size
- Rate limiting: basic protection against form spam (e.g. simple honeypot field, or rate limit by IP in server action)

## Open Questions / Future Considerations

- Bruno will provide an egg carton photo for the tray visualization base
- Seed catalog will be populated manually by Bruno
- Future: Neon DB + GCS as intermediate queue if GitHub API becomes a bottleneck
- Future: different tray sizes beyond 2×6
- Future: search/filtering on homepage
- Future: proper authentication if the trust model needs to change
