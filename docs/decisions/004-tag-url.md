# 004: Tag URL

Status: **proposed** (2026-11-15)

Expands on the tag URL in [001](001-url-namespace.md): the constraints, the numbers and the trade-offs behind it.

Tags get printed as small as 2 x 2 cm, stuck on uneven surfaces (our 7 x 7 cm pots have vertical ridges) and scanned outside by any phone: an iPhone 13 reads everything instantly, a Samsung SM-G525 fails on denser codes. A scan should open the spot in a single page load, with no flash of a loading page, and reading must work without JavaScript. Once printed, a tag's URL can never change.

## Decision

The QR code holds:

```
HTTPS://PB.POD.BRUSSELS/T/Q7VD2KXO9LMZA1RTYP3FWG8H
```

- **Secret in the path.** 24 chars uppercase base36 (`0-9A-Z`): 36^24 = 2^124.08, so 124.08 bits. Case-insensitive: the server uppercases it before anything else.
- **Error correction H** (30%) as the baseline, for ridges, scratches and dirt.
- **Short domain.** `pb.pod.brussels` 308-redirects to `plantbook.pod.brussels`, keeping the path.
- **QR version 4** (33 x 33 modules): with a 2-module border, 0.54 mm per module at 2 x 2 cm. The whole URL is one alphanumeric segment, which is why it fits.

## Scan flow

1. `/t/<secret>` (any case: Next.js routes are case-sensitive, so `/T/` must reach the same handler) uppercases the secret and rejects anything that isn't `^[0-9A-Z]{24}$` before touching the database.
2. Looks up the tag by `sha256(secret)`, sets the edit-grant cookie and redirects to the tag's spot, or to the "what is this tag for?" flow if it isn't attached.
3. Responds with `Referrer-Policy: no-referrer` and `Cache-Control: no-store`. After the redirect the address bar shows the spot's URL, so that's what people copy and share.

Tag URLs are exempt from 001's redirect to lowercase: the server handles them in any case.

## Secrets

- Generated with `crypto.randomInt` (cryptographically secure, unbiased), in `src/lib/tag-secret.ts`.
- Stored as unsalted SHA-256, unique. A random 124-bit secret needs no slow hash or salt: brute force is out of reach either way, and lookup by hash rules out a per-row salt.
- A coarse per-IP rate limit protects cost, not secrecy. Not required for launch.
- Later print runs may use another length; the server tells formats apart by length and keeps accepting every format ever printed.

## Why

**QR size is the constraint.** Every version adds 4 modules per side, so at a fixed print size each step makes modules smaller. QR's alphanumeric mode (`0-9`, `A-Z`, space, `$%*+-./:`) costs 5.5 bits per char; anything else falls back to byte mode at 8. Uppercase base36 carries 5.17 bits per 5.5 spent (94%); base64url carries 6 per 8 (75%) and its lowercase letters force byte mode. `#` isn't alphanumeric either, so a fragment costs a byte segment of its own.

Measured with `qrcode`, at H, 2 x 2 cm:

| QR content | Bits | Version | Module |
|---|---|---|---|
| `https://plantbook.pod.brussels/t#` + 22 base64url (001 before this revision) | 128 | 6 | 0.44 mm |
| `HTTPS://PB.POD.BRUSSELS/T#` + 22 base64url | 128 | 5 | 0.49 mm |
| `HTTPS://PB.POD.BRUSSELS/T#` + 30 digits | 99 | 4 | 0.54 mm |
| `HTTPS://PB.POD.BRUSSELS/T/` + 35 digits | 116 | 4 | 0.54 mm |
| `HTTPS://PB.POD.BRUSSELS/T/` + 24 base36 | **124.08** | 4 | 0.54 mm |
| `HTTPS://PLANTBOOK.POD.BRUSSELS/T/` + 17 base36 | 87.89 | 4 | 0.54 mm |

Lowercase `https://plantbook.pod.brussels/t/` leaves room for about one char at version 4.

**The secret in the path is a deliberate trade.** It reaches Vercel's request logs (for both hosts) and browser history; anyone who can read those could edit that tag's spot. The stakes are plant notes, and the readers are us and Vercel. In exchange: one request, no JavaScript, no flash, and a smaller code than the fragment allows. This is how capability URLs usually work (Google Docs "anyone with the link", secret iCal addresses, Slack webhooks, event tickets), as described in the W3C TAG's *Good Practices for Capability URLs*. Keeping secrets in the fragment is mostly done for end-to-end encryption (Mega, Bitwarden Send), where the server must never see the key; our server checks the secret anyway. Analytics or monitoring added later must not record `/t/` paths.

## Rejected

- **Secret in the fragment** (001's first version). Needs JavaScript and a loading page that flashes on every scan; `#` costs a byte segment.
- **Public tag ID + shorter secret** (`/T/<id>#<secret>`). Looking up by ID allows a salted Argon2id hash and per-tag throttling, so 60 bits would do. Comparable QR size, but much more machinery, and every guess costs us an Argon2id hash.
- **Signed tokens** (`HMAC(key, tag_id)`). Nothing to store, but a leaked key compromises every printed tag and a single tag can't be revoked.
- **A bigger alphabet.** Adding `$*+-.:` (base41) gains 4.5 bits, but scanners and URL normalisation may mangle punctuation.
- **Lower error correction.** Q saves nothing (also version 4). M (version 3) makes modules only 12% bigger, not worth losing H's recovery on ridged or dirty tags.

## Later

- Dropping `/T/` on `pb.pod.brussels` (the redirect maps `/<secret>` to `/t/<secret>`) gives 26 chars, 134 bits, at version 4. An option for a later print run.
- Serving `pb.pod.brussels` directly saves the redirect's round trip. Server-side only, so printed tags keep working.
- Print and scan the agreed format on the Samsung before the first batch; `/temp/tags` lets us vary size, length, error correction and case.
