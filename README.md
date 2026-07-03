# Knight Market

**The campus app UCF students actually needed.**

Knight Market is a student-focused marketplace and campus-life platform for UCF.

> **Disclaimer:** Built for students. Not officially affiliated with UCF.

[![Quality](https://github.com/OWNER/REPO/actions/workflows/quality.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/quality.yml)

> Replace `OWNER/REPO` in the badge URL with your GitHub repository path after publishing.

---

## Quick Start

```bash
npm install
npx playwright install chromium   # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run smoke` | Route file smoke test |
| `npm run e2e` | Playwright E2E (23 tests) |
| `npm run check` | lint + type-check + build |
| `npm run quality` | check + smoke + e2e |

```bash
npm run quality   # full gate before merging
```

---

## CI / Pull Requests

GitHub Actions workflow **Quality** (`.github/workflows/quality.yml`) runs on every push and PR:

- ESLint, TypeScript, production build
- Route smoke script
- Playwright E2E (Chromium)

On failure, Playwright reports and test-results are uploaded as artifacts.

**Pull requests** use `.github/pull_request_template.md` — include testing checklist and risk notes.

**Issues** use templates under `.github/ISSUE_TEMPLATE/`.

---

## Auth Modes

- `NEXT_PUBLIC_AUTH_MODE=supabase` enables real Supabase magic-link email auth.
- `NEXT_PUBLIC_AUTH_MODE=local` keeps the existing localStorage test flow for E2E/CI.
- Only `@ucf.edu` and `@knights.ucf.edu` emails are allowed before auth requests are sent.

### Local Test Flow

1. `/sign-in` -> `test@ucf.edu` (or any allowed UCF domain)
2. `/verify` -> **`123456`**
3. `/onboarding` -> complete profile -> `/marketplace`

### Supabase Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PRODUCT_MODE=real
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

Copy from [`.env.local.example`](.env.local.example). Full setup guide: [docs/supabase-auth-setup.md](docs/supabase-auth-setup.md)

---

## Private beta deployment (Vercel)

Knight Market can be deployed for **private beta testing** — not public launch. Use this to validate real auth, listings, and messaging with a founder + friend on a deployed HTTPS URL.

**Guide:** [docs/private-beta-deployment.md](docs/private-beta-deployment.md)

**Real modules today:**

- Auth (UCF email magic link)
- Marketplace listings
- Listing image upload
- Buyer–seller messaging (listings)

**Coming soon (honest empty states in real mode):**

- Housing, Tutoring, Jobs, Events, Lost & Found, Discounts

### Supabase Database Schema

The production schema (tables, RLS, storage buckets) lives in SQL migrations:

- Migration: [supabase/sql/001_core_product_schema.sql](supabase/sql/001_core_product_schema.sql)
- Messaging policy: [supabase/sql/002_messaging_policy_fix.sql](supabase/sql/002_messaging_policy_fix.sql)
- Setup guide: [docs/supabase-core-schema-setup.md](docs/supabase-core-schema-setup.md)
- Rollback: [supabase/sql/001_core_product_schema_rollback.sql](supabase/sql/001_core_product_schema_rollback.sql)

Apply in the Supabase SQL Editor before private beta testing.

---

## Product Data Modes

`NEXT_PUBLIC_PRODUCT_MODE` controls whether mock catalog content appears in the live app:

| Mode | Behavior |
|---|---|
| `real` | No fake marketplace listings, housing posts, tutors, or message previews. Empty states when nothing is user-created. **Default with Supabase auth.** |
| `demo` | Mock data enabled for E2E tests and visual previews. **Default with local auth.** |

If unset:

- `NEXT_PUBLIC_AUTH_MODE=supabase` → defaults to **real**
- `NEXT_PUBLIC_AUTH_MODE=local` → defaults to **demo**

E2E (`npm run dev:e2e`) sets both `NEXT_PUBLIC_AUTH_MODE=local` and `NEXT_PUBLIC_PRODUCT_MODE=demo`, and runs the test server on **port 3100** (isolated from your dev server on 3000).

Developers can still append `?demo=1` in local development to preview mock catalog data while `PRODUCT_MODE=real` — this is not exposed in the product UI.

### Current limitations (real mode)

- Supabase **core schema is prepared** — see [docs/supabase-core-schema-setup.md](docs/supabase-core-schema-setup.md)
- **Marketplace listings** use Supabase when `NEXT_PUBLIC_AUTH_MODE=supabase` and `NEXT_PUBLIC_PRODUCT_MODE=real`
- **Saved listings** still use localStorage (Supabase `saved_listings` table ready but not wired)
- **Messaging** uses Supabase when `NEXT_PUBLIC_AUTH_MODE=supabase` and `NEXT_PUBLIC_PRODUCT_MODE=real`
- Housing, jobs, events, tutoring, discounts, AI, and lost & found show **coming soon** empty states
- Home page shows **honest module statuses** — no fake campus counts or preview people
- **E2E/CI** still uses `local` auth + `demo` product mode

### Manual Supabase marketplace test

1. Set `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   NEXT_PUBLIC_AUTH_MODE=supabase
   NEXT_PUBLIC_PRODUCT_MODE=real
   NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
   ```
2. Restart: `npm run dev`
3. Sign in with a UCF email and complete onboarding
4. Visit `/sell`, upload a real image (JPEG/PNG/WebP), and publish
5. Verify **Table Editor → listings** has a new row
6. Verify **Storage → listing-images** has a file under `{your-user-id}/`
7. Verify `/marketplace`, listing detail, and `/profile` show the listing
8. Delete the listing and confirm it disappears

### Manual Supabase messaging test

Requires core schema applied plus [supabase/sql/002_messaging_policy_fix.sql](supabase/sql/002_messaging_policy_fix.sql) (allows participants to update `last_message_at` when sending).

> **Note:** You cannot message your own listing. Use two verified UCF accounts, or temporarily create a second auth user.

1. Account A: sign in, complete onboarding, post a marketplace listing
2. Account B: sign in with a different UCF email, complete onboarding
3. Account B: open Account A's listing and click **Message Seller**
4. Confirm `/messages?conversation=<id>` opens with the thread
5. Account B sends a message
6. **Table Editor → conversations** — row with both participant IDs and `listing_id`
7. **Table Editor → messages** — row with `body`, `sender_id`, `conversation_id`
8. Account A signs in, visits `/messages`, sees the conversation
9. Account A replies; both users see the thread after refresh (no realtime yet)

---

## Service Layer

Providers use abstractions in `src/lib/services/` so localStorage can be swapped for Supabase later:

| Module | Interface | Current implementation |
|---|---|---|
| Auth | `auth-service.ts` | `local-auth-service.ts` |
| Marketplace | `marketplace-service.ts` | `local-marketplace-service.ts` / `supabase-marketplace-service.ts` |
| Messaging | `messaging-service.ts` | `supabase-messaging-service.ts` (real) / demo mock inbox |
| Storage helpers | `storage-service.ts` | Safe JSON + SSR fallbacks |

See [docs/backend-migration-plan.md](docs/backend-migration-plan.md) for the database schema, RLS summary, and frontend integration order.

---

## E2E Tests

```bash
npm run e2e
npm run e2e:ui      # interactive
npm run e2e:headed  # visible browser
```

Covers: home, auth, marketplace (incl. featured dedupe), protected routes, sell flow, mobile, error boundaries.

Dev-only error demo: `/dev/error-demo`

---

## Product Status

- 23+ routes, error boundaries, not-found pages
- Marketplace with featured row dedupe, search/filter, sell/publish
- Playwright E2E + GitHub Actions CI
- QA checklist at `/qa`

---

## Known Limitations

- Supabase marketplace and messaging are live in real+supabase mode; saved listings remain localStorage
- Real product mode hides mock catalog data; housing and other modules show coming-soon states
- No payments or AI API yet
- E2E uses local/demo mode; production real mode requires Supabase schema applied manually
- CI badge URL needs your GitHub repo path

---

## Structure

```
src/app/              # Next.js routes
src/components/       # UI + providers
src/lib/services/     # Auth/marketplace abstraction (migration seam)
docs/                 # Backend migration + Supabase setup guides
supabase/sql/         # Core product schema SQL (apply in Dashboard)
tests/e2e/            # Playwright specs
.github/workflows/    # CI
```
