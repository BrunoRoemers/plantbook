# 001: URL namespace

Status: **accepted** (2026-11-07)

Domain: `plantbook.pod.brussels`. Routes use user-facing words ([domain model](../domain-model.md)).

## Case-insensitive
All URLs are case-insensitive, except the tag secret. The canonical form is lowercase; other casings redirect to it. Public IDs therefore use Crockford Base32 (`0-9a-z` without `i l o u`).

| ID | Format | Example |
|---|---|---|
| Public ID | 10 chars Crockford Base32 | `4ht9wq2m5k` |
| Tag secret | 22 chars base64url, case-sensitive (128 bits) | `q7Vd2kXo9LmZa1RtYp3fWg` |

## Routes
| URL | Purpose |
|---|---|
| `https://plantbook.pod.brussels/t#q7Vd2kXo9LmZa1RtYp3fWg` | In the QR code. Exchanges the secret for an edit grant. |
| `/spots/4ht9wq2m5k` | Spot timeline |
| `/plants/7fk2pqx9rb(-optional-slug)` | Plant timeline |
| `/notes/zr8mn3cv0t` | Single note |

## Scan flow
The secret sits in the fragment, so it never reaches server logs or Referer headers. The `/t` page posts it to the server, receives an edit-grant cookie and a destination, removes the fragment from browser history with `history.replaceState`, and navigates on.
