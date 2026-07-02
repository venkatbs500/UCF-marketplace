# Supabase Core Schema Setup

This guide covers the **production database foundation** for Knight Market. The SQL lives in the repo; the frontend is **not wired** to these tables yet.

## What this schema adds

| Area | Tables / buckets |
|---|---|
| Users | `profiles` (extends `auth.users`) |
| Marketplace | `listings`, `saved_listings` |
| Housing | `housing_posts`, `roommate_profiles` |
| Campus life | `tutoring_profiles`, `campus_jobs`, `campus_events`, `lost_found_items`, `student_discounts` |
| Social / trust | `conversations`, `messages`, `reviews`, `reports` |
| Storage | `listing-images`, `housing-images`, `lost-found-images`, `event-images`, `profile-avatars` |

Also included:

- `set_updated_at()` trigger on tables with `updated_at`
- Indexes on status, ownership, search, and messaging columns
- Row Level Security (RLS) on every table and storage bucket
- Rollback script: `supabase/sql/001_core_product_schema_rollback.sql`

## Prerequisites

1. A Supabase project with Auth already configured (see [supabase-auth-setup.md](./supabase-auth-setup.md))
2. UCF email domain restriction working in the app
3. `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PRODUCT_MODE=real
```

Do **not** commit `.env.local` or service-role keys.

## How to run the migration

### Option A — Supabase SQL Editor (recommended for first apply)

1. Open your project in [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New query**
3. Paste the full contents of `supabase/sql/001_core_product_schema.sql`
4. Click **Run**
5. Confirm no errors in the output panel

### Option B — Supabase CLI (when local CLI is configured)

```bash
# From repo root, after `supabase link`
supabase db execute --file supabase/sql/001_core_product_schema.sql
```

## How to verify tables

In SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'listings', 'housing_posts', 'roommate_profiles',
    'tutoring_profiles', 'campus_jobs', 'campus_events',
    'lost_found_items', 'student_discounts', 'conversations',
    'messages', 'saved_listings', 'reviews', 'reports'
  )
ORDER BY table_name;
```

Expected: **14 rows**.

Quick column check:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'listings'
ORDER BY ordinal_position;
```

## How to verify storage buckets

Dashboard → **Storage** → confirm these public buckets exist:

- `listing-images`
- `housing-images`
- `lost-found-images`
- `event-images`
- `profile-avatars`

Each bucket should allow **JPEG, PNG, WebP** up to **5 MB**.

SQL check:

```sql
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN (
  'listing-images', 'housing-images', 'lost-found-images',
  'event-images', 'profile-avatars'
)
ORDER BY id;
```

## How to verify RLS

### Tables

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'listings', 'housing_posts', 'roommate_profiles',
    'tutoring_profiles', 'campus_jobs', 'campus_events',
    'lost_found_items', 'student_discounts', 'conversations',
    'messages', 'saved_listings', 'reviews', 'reports'
  )
ORDER BY tablename;
```

All should show `rowsecurity = true`.

### Policy smoke test (authenticated)

After signing in via the app or creating a test user:

```sql
-- As service role in SQL Editor (bypasses RLS) — insert a test profile
INSERT INTO public.profiles (id, email, full_name)
VALUES ('<auth-user-uuid>', 'test@ucf.edu', 'Test Knight')
ON CONFLICT (id) DO NOTHING;
```

Then from the app (anon/authenticated client), verify:

- Active listings are readable when `status = 'active'`
- Draft listings are visible only to the seller
- Saved listings are visible only to the owning user

### Storage

Upload path convention (enforced by RLS):

```
{bucket-id}/{auth.uid()}/{filename}
```

Example: `listing-images/a1b2c3d4-.../desk-photo.webp`

## What is NOT wired yet

The app still uses **localStorage** for marketplace data in real mode. This sprint does **not** change frontend behavior.

| Feature | Current state |
|---|---|
| Profiles / onboarding | Auth works; profile row not synced from app |
| Marketplace listings | `local-marketplace-service.ts` |
| Saved listings | localStorage |
| Listing images | Emoji placeholders; no upload |
| Housing, tutoring, jobs, events | Coming-soon UI |
| Lost & found, discounts | Coming-soon UI |
| Messaging | Coming-soon UI |
| Reviews / reports / admin | Mock or placeholder only |
| E2E / CI | `NEXT_PUBLIC_AUTH_MODE=local` + `PRODUCT_MODE=demo` |

Local/demo mode is unchanged and remains the E2E path.

## Rollback

Only use in dev/staging unless you understand data loss implications.

1. **Empty storage buckets** (required before bucket deletion)
2. Run `supabase/sql/001_core_product_schema_rollback.sql` in SQL Editor

## Future frontend integration order

Wire modules in this order to minimize rework:

1. **Profiles / onboarding** — sync `AuthUser` ↔ `profiles` on sign-in and onboarding complete
2. **Marketplace listings** — `supabase-marketplace-service.ts` replacing localStorage
3. **Listing images** — upload to `listing-images/{uid}/`, store paths on `listings.images`
4. **Saved listings** — `saved_listings` join table
5. **Housing** — `housing_posts` + `roommate_profiles`
6. **Tutoring** — `tutoring_profiles`
7. **Jobs / events** — `campus_jobs`, `campus_events`
8. **Lost & found** — `lost_found_items`
9. **Discounts** — `student_discounts`
10. **Messaging** — `conversations` + `messages` (consider Realtime)
11. **Reviews / reports / admin** — trust & moderation queue

## Related docs

- [supabase-auth-setup.md](./supabase-auth-setup.md) — Auth env vars and redirect URLs
- [backend-migration-plan.md](./backend-migration-plan.md) — Architecture and migration strategy
