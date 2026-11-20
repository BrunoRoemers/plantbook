# 001: URL namespace

Status: **accepted** (2026-11-07, tag URL revised 2026-11-20)

Domain: `plantbook.pod.brussels`. Routes use user-facing words ([domain model](../domain-model.md)).

## Case-insensitive
All URLs are case-insensitive. The canonical form is lowercase; other casings redirect to it. Public IDs therefore use Crockford Base32 (`0-9a-z` without `i l o u`).

| ID | Format | Example |
|---|---|---|
| Public ID | 10 chars Crockford Base32 | `4ht9wq2m5k` |
| Tag secret | 24 chars base36, case-insensitive (124.08 bits) | `Q7VD2KXO9LMZA1RTYP3FWG8H` |

## Routes
| URL | Purpose |
|---|---|
| `HTTPS://PB.POD.BRUSSELS/T/Q7VD2KXO9LMZA1RTYP3FWG8H` | In the QR code. Exchanges the secret for an edit grant. |
| `/spots/4ht9wq2m5k` | Spot timeline |
| `/plants/7fk2pqx9rb(-optional-slug)` | Plant timeline |
| `/notes/zr8mn3cv0t` | Single note |

## Scan flow
The QR code is uppercase so the whole URL fits QR's compact alphanumeric mode. `/t/<secret>` looks up the tag by the secret's SHA-256, sets an edit-grant cookie and redirects to the tag's spot: one request, no JavaScript. The secret does reach server logs; [004](004-tag-url.md) has the constraints, numbers and trade-offs behind this.
