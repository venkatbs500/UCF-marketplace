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
```

Full setup guide: [docs/supabase-auth-setup.md](docs/supabase-auth-setup.md)

### Supabase Database Schema

The full production schema (tables, RLS, storage buckets) is prepared in SQL but **not wired to the frontend yet**:

- Migration: [supabase/sql/001_core_product_schema.sql](supabase/sql/001_core_product_schema.sql)
- Setup guide: [docs/supabase-core-schema-setup.md](docs/supabase-core-schema-setup.md)
- Rollback: [supabase/sql/001_core_product_schema_rollback.sql](supabase/sql/001_core_product_schema_rollback.sql)

Apply the SQL in the Supabase SQL Editor when ready. The app continues using localStorage for marketplace data until a future sprint connects `supabase-marketplace-service.ts`.

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

E2E (`npm run dev:e2e`) sets both `NEXT_PUBLIC_AUTH_MODE=local` and `NEXT_PUBLIC_PRODUCT_MODE=demo`.

Developers can still append `?demo=1` in local development to preview mock catalog data while `PRODUCT_MODE=real` — this is not exposed in the product UI.

### Current limitations (real mode)

- Supabase **core schema is prepared** (profiles, listings, housing, messaging, etc.) — see [docs/supabase-core-schema-setup.md](docs/supabase-core-schema-setup.md)
- **Frontend integration is pending** — listings still use localStorage, not Supabase queries
- **Messaging** shows honest coming-soon copy
- **Real image upload** is coming next (storage buckets exist in SQL)
- Housing, jobs, events, tutoring, discounts, AI, and lost & found show **coming soon** empty states
- Home page shows **honest module statuses** — no fake campus counts or preview people
- Only the **marketplace** accepts real student posts locally; other modules are not live yet
- **E2E/CI** still uses `local` auth + `demo` product mode

---

## Service Layer

Providers use abstractions in `src/lib/services/` so localStorage can be swapped for Supabase later:

| Module | Interface | Current implementation |
|---|---|---|
| Auth | `auth-service.ts` | `local-auth-service.ts` |
| Marketplace | `marketplace-service.ts` | `local-marketplace-service.ts` |
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

- Supabase core schema SQL is ready; marketplace listings remain localStorage-based until wired
- Real product mode hides mock catalog data; messaging and housing tools show coming-soon states
- No payments, real image upload UI, or AI API yet
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
