# 003: Identity

Status: **accepted** (2026-11-13)

PlantBook must work without an account (a friend scans a tag and posts), yet notes need an author and plants a caretaker, and nothing should be lost when someone signs up later.

## Decision

- **Everyone who writes is a user.** On the first write (not on a scan or page view), the browser gets an anonymous [Better Auth](https://better-auth.com) user via its anonymous plugin. Rows always reference a real `user.id`.
- **An email makes it last.** Signing in with an email (passwordless) upgrades the browser's identity. In the plugin's `onLinkAccount({ anonymousUser, newUser })`, every row owned by the anonymous user moves to the email user. This also merges into an existing account from another device.
- **Edit rights come from the tag or from identity.** Scanning a tag's secret grants the current user edit rights on the tag's current spot and its plants; a caretaker can edit their plants without the tag. The escape hatch (later) disables the tag-derived rights for a plant, so only the identity-derived ones remain (see the [domain model](../domain-model.md#access-rules)).
- **Prompt for an email when there's something to lose:** giving a plant away, adopting one, or after a few notes.

## Consequences

- Any new table that references `user` must be added to the `onLinkAccount` merge, covered by a test.
- Anonymous users with no data can be cleaned up periodically if they pile up.
- Cleared cookies lose an anonymous identity. Its data stays, reachable again through the tag.
