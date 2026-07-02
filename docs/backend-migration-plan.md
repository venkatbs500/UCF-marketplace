# Knight Market — Backend Migration Plan

> **Status:** Planning document only. No database is implemented yet.

## Current architecture (localStorage)

| Key | Purpose |
|---|---|
| `knight-market-session` | Mock auth session (user + pending email) |
| `knight-market-saved-listings` | Saved listing IDs |
| `knight-market-user-listings` | User-published listings |
| `knight-market-listing-draft` | In-progress sell draft |

Client state uses React Context + `useSyncExternalStore` with cached snapshots for hydration safety.

**Service layer (migration seam):**

- `src/lib/services/local-auth-service.ts` → swap for Supabase Auth
- `src/lib/services/local-marketplace-service.ts` → swap for Supabase queries
- `src/lib/services/storage-service.ts` → safe JSON helpers (may remain for client cache)

Providers import services, not raw localStorage.

---

## Proposed Supabase tables

### Core

| Table | Notes |
|---|---|
| `profiles` | Extends auth.users — name, major, year, campus_area, bio, trust_score, avatar_url |
| `listings` | Marketplace items — title, price, category, condition, status, seller_id FK |
| `saved_listings` | user_id + listing_id composite PK |
| `seller_reviews` | reviewer_id, seller_id, rating, comment, listing_id optional |

### Campus modules

| Table | Notes |
|---|---|
| `housing_posts` | Subleases, roommate posts |
| `tutoring_profiles` | Tutor offerings, rates, subjects |
| `jobs` | Campus gigs, part-time, research |
| `events` | Club events, hackathons, career fairs |
| `lost_found_items` | Lost/found reports |
| `discounts` | Student deals near campus |
| `messages` | Thread metadata |
| `message_items` | Individual messages in a thread |
| `reports` | Moderation reports |

---

## Auth plan

1. **Email verification** — Supabase Auth magic link or OTP (replace mock code `123456`)
2. **UCF email restriction** — Edge function or sign-up hook validating `@ucf.edu` / `@knights.ucf.edu`
3. **Onboarding** — After first sign-in, require profile completion before marketplace write actions
4. **Session** — Supabase session replaces `knight-market-session`; providers read from `supabase.auth.getSession()`

---

## Storage plan

| Asset | Supabase Storage bucket |
|---|---|
| Listing images | `listing-images` (public read, authenticated write) |
| Profile avatars | `avatars` (public read, owner write) |

Use signed URLs for uploads; store paths on `listings.images` and `profiles.avatar_url`.

---

## Row Level Security (RLS) notes

- **profiles:** public read for marketplace; users update own row only
- **listings:** public read for `status = active`; insert/update/delete by seller_id = auth.uid()
- **saved_listings:** user can only read/write own rows
- **messages:** participants only
- **reports:** insert by authenticated users; read by admin role only
- **admin moderation:** separate `admin` claim or `is_admin` on profiles

---

## Migration order

1. **Auth** — Supabase project, email domain rules, session in providers
2. **Profiles** — Migrate onboarding fields; map `AuthUser` → `profiles`
3. **Listings** — Seed mock listings; migrate user-created listings from localStorage export
4. **Saved listings** — `saved_listings` join table
5. **Messaging** — Real-time threads (Supabase Realtime)
6. **Housing / tutoring / jobs / events** — Module-by-module table + RLS
7. **Admin moderation** — Reports queue, listing status updates, user bans

---

## Risks and open questions

- **UCF SSO** — Official SAML/OIDC may be required long-term vs email OTP
- **Image moderation** — Needed before open uploads
- **Payment escrow** — Out of scope until trust/moderation is solid
- **localStorage export** — One-time migration script for early beta users?
- **Featured listings** — Admin flag vs algorithmic; currently `isFeatured` on listing row
- **Cross-device sync** — Primary motivation for backend migration

---

## Next engineering steps

1. Add `supabase-auth-service.ts` implementing `AuthService`
2. Add `supabase-marketplace-service.ts` implementing `MarketplaceService`
3. Feature flag: `NEXT_PUBLIC_DATA_SOURCE=local|supabase`
4. CI integration tests against local Supabase (`supabase start`)
