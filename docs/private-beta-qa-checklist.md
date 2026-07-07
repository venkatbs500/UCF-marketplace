# Private Beta QA Checklist

Manual checks before/after each private beta deploy. Run with two verified UCF accounts where messaging is involved. Automated coverage runs via `npm run quality`.

## Auth

- [ ] Sign in with a UCF email (`@ucf.edu` / `@knights.ucf.edu`); magic link lands on `/auth/callback`
- [ ] Verify page: resend link, use a different email, back to sign-in all work
- [ ] Open magic link on mobile and desktop
- [ ] Non-UCF email is rejected before any auth call

## Modules

- [ ] Create + delete a marketplace listing with an image (image removed from `listing-images`)
- [ ] Save / unsave a listing
- [ ] Create a housing post; delete it (image removed from `housing-images`)
- [ ] Create a tutor profile
- [ ] Create a lost/found item
- [ ] Create a job post
- [ ] Create an event
- [ ] Create a student discount
- [ ] Empty states show correct CTAs for each module

## Messaging

- [ ] Message a seller / poster from a listing or module detail page
- [ ] Send and receive messages between two accounts (realtime + unread badge)
- [ ] **Delete own message** → bubble shows "Message deleted"; other participant sees it live
- [ ] **Cannot delete** the other participant's message (no Delete action)
- [ ] Report button still shows on other participant's non-deleted messages
- [ ] **Delete conversation** removes it from your inbox only; other participant still sees it
- [ ] Hidden conversation reappears for you when the other person sends a new message
- [ ] Unread nav badge recalculates after delete/hide
- [ ] Privacy banner visible: content reviewed only for safety reports

## Reports / admin moderation

- [ ] Report content (listing, message, user)
- [ ] Admin dashboard shows readable target labels (e.g. "marketplace listing", "message")
- [ ] Admin dashboard does **not** show raw message bodies
- [ ] Admin privacy reminder is visible
- [ ] Admin can hide/remove reported content; user soft-delete is unaffected

## Profile & navigation

- [ ] Profile My Posts hub shows your content across modules (no fake data)
- [ ] Mobile nav works; messages icon shows unread badge
- [ ] Log out, then log in on another device/browser

## Privacy / data

- [ ] `012_message_deletion_privacy.sql` applied in Supabase
- [ ] Deleted message rows keep `deleted_at`/`deleted_by` (not hard-deleted)
- [ ] No `service_role` key in frontend or env examples
- [ ] Review [messaging-privacy.md](messaging-privacy.md) for plaintext-storage policy

## Build gate

- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] `npm run smoke`
- [ ] `npm run e2e`
- [ ] `npm run quality`
