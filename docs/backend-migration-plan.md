# Knight Market — Backend Migration Plan

> **Status:** Supabase Auth is live. Core product schema SQL is prepared in `supabase/sql/`. Frontend integration is **pending**.

## Current architecture

### Auth (Supabase — live)

- `src/lib/services/supabase-auth-service.ts` — magic-link email auth
- UCF domain restriction (`@ucf.edu`, `@knights.ucf.edu`) enforced in app before auth calls
- Session via Supabase client; local mode retained for E2E/CI

### Product data (localStorage — not yet migrated)

| Key | Purpose |
|---|---|
| `knight-market-session` | Local auth session (E2E/demo only) |
| `knight-market-saved-listings` | Saved listing IDs |
| `knight-market-user-listings` | User-published listings |
| `knight-market-listing-draft` | In-progress sell draft |

Client state uses React Context + `useSyncExternalStore` with cached snapshots for hydration safety.

**Service layer (migration seam):**

- `src/lib/services/local-auth-service.ts` ↔ `supabase-auth-service.ts` (auth done)
- `src/lib/services/local-marketplace-service.ts` → future `supabase-marketplace-service.ts`
- `src/lib/services/storage-service.ts` → safe JSON helpers (may remain for client cache)

Providers import services, not raw localStorage.

### Product mode

- `NEXT_PUBLIC_PRODUCT_MODE=real` — honest empty states; no fake catalog data in production
- `NEXT_PUBLIC_PRODUCT_MODE=demo` — mock data for E2E and visual previews
- Real deployment hides fake users/data until each module is wired to Supabase

---

## Supabase core schema (prepared)

Full SQL: **`supabase/sql/001_core_product_schema.sql`**

Setup guide: **[supabase-core-schema-setup.md](./supabase-core-schema-setup.md)**

Rollback: **`supabase/sql/001_core_product_schema_rollback.sql`**

### Tables

| Table | Notes |
|---|---|
| `profiles` | Extends `auth.users` — name, major, year, campus_area, bio, trust_score, onboarding flag |
| `listings` | Marketplace items — title, price, category, condition, status, seller_id FK |
| `saved_listings` | `user_id` + `listing_id` composite PK |
| `housing_posts` | Subleases, roommate posts, lease transfers, apartment reviews |
| `roommate_profiles` | Roommate search profiles |
| `tutoring_profiles` | Tutor offerings, rates, subjects |
| `campus_jobs` | Campus gigs, part-time, research |
| `campus_events` | Club events, hackathons, career fairs |
| `lost_found_items` | Lost/found reports |
| `student_discounts` | Student deals near campus |
| `conversations` | Thread metadata with optional listing/housing/tutor context |
| `messages` | Individual messages in a conversation |
| `reviews` | User-to-user and listing reviews |
| `reports` | Moderation reports (reporter-only read for now) |

### Storage buckets

| Bucket | Purpose |
|---|---|
| `listing-images` | Marketplace listing photos |
| `housing-images` | Housing post photos |
| `lost-found-images` | Lost & found photos |
| `event-images` | Campus event photos |
| `profile-avatars` | Profile avatars |

Public read. Authenticated write to `{uid}/` folder paths. 5 MB limit; JPEG/PNG/WebP.

### Row Level Security (implemented in SQL)

- **profiles:** authenticated read; users insert/update own row
- **listings:** public read for `status = active`; seller CRUD own rows (owners can read drafts)
- **housing_posts / roommate_profiles / tutoring_profiles:** public read active; owner CRUD
- **campus_jobs / campus_events / student_discounts:** public read active; authenticated create; owner update/delete
- **lost_found_items:** public read `status = open`; owner CRUD
- **saved_listings:** user read/insert/delete own rows only
- **conversations / messages:** participants only
- **reviews:** public read; authenticated create as self; update/delete own reviews only
- **reports:** authenticated insert; reporter reads own reports only (admin queue later)
- **storage:** public read; authenticated upload/update/delete in own `{uid}/` folder

---

## Auth plan

1. **Email verification** — Supabase magic link ✅
2. **UCF email restriction** — App-side validation ✅ (Edge hook optional later)
3. **Onboarding** — After first sign-in, require profile completion → **wire to `profiles` table next**
4. **Session** — Supabase session ✅

---

## Migration order (frontend wiring)

1. **Profiles** — Sync onboarding fields; map `AuthUser` → `profiles` on sign-in
2. **Listings** — `supabase-marketplace-service.ts`; migrate user-created localStorage listings
3. **Listing images** — Upload to `listing-images`; store paths on `listings.images`
4. **Saved listings** — `saved_listings` join table
5. **Housing** — `housing_posts` + `roommate_profiles`
6. **Tutoring** — `tutoring_profiles`
7. **Jobs / events** — `campus_jobs`, `campus_events`
8. **Lost & found** — `lost_found_items`
9. **Discounts** — `student_discounts`
10. **Messaging** — `conversations` + `messages` (Supabase Realtime)
11. **Reviews / reports / admin** — Trust & moderation queue

---

## Risks and open questions

- **UCF SSO** — Official SAML/OIDC may be required long-term vs email OTP
- **Image moderation** — Needed before open uploads at scale
- **Payment escrow** — Out of scope until trust/moderation is solid
- **localStorage export** — One-time migration script for early beta users?
- **Featured listings** — Admin flag vs algorithmic; `is_featured` column exists on `listings`
- **Cross-device sync** — Primary motivation for backend migration
- **Admin RLS** — Reports currently reporter-only read; add `is_admin` claim later

---

## Next engineering steps

1. Apply `001_core_product_schema.sql` in Supabase Dashboard (see setup guide)
2. Add `supabase-marketplace-service.ts` implementing `MarketplaceService`
3. Sync profiles on onboarding complete
4. Feature flag: `NEXT_PUBLIC_DATA_SOURCE=local|supabase` (optional, alongside product mode)
5. CI integration tests against local Supabase (`supabase start`) when CLI is adopted
