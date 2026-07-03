# Private Beta Deployment (Vercel)

This guide covers deploying Knight Market for **private beta testing** — founder and a friend validating real auth, listings, and messaging on a deployed URL.

This is **not** a public launch. Keep the URL unlisted and invite-only.

---

## 1. Purpose

- Test Supabase magic-link auth on a real HTTPS domain
- Post marketplace listings with image upload
- Exercise buyer–seller messaging end-to-end
- Confirm Vercel production build and env configuration before wider rollout

---

## 2. Vercel setup

1. Push the repo to GitHub (if not already).
2. In [Vercel](https://vercel.com), **Add New Project** → import the GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build settings (defaults are fine):

| Setting | Value |
|---------|--------|
| Install Command | `npm install` or `npm ci` |
| Build Command | `npm run build` |
| Output Directory | *(default — leave empty)* |
| Node.js Version | 20.x recommended |

5. Add environment variables (see section 3) **before** the first production deploy.
6. Deploy. Note your production URL, e.g. `https://knight-market.vercel.app`.

---

## 3. Required Vercel environment variables

Set these for **Production** (and Preview if you test preview URLs):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-or-publishable-key>
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PRODUCT_MODE=real
NEXT_PUBLIC_APP_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
NEXT_PUBLIC_ADMIN_EMAILS=your-email@ucf.edu
```

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Anon / publishable key only** — never `service_role` |
| `NEXT_PUBLIC_AUTH_MODE` | Must be `supabase` for real magic links |
| `NEXT_PUBLIC_PRODUCT_MODE` | Must be `real` — no fake catalog data |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, **no trailing slash** |
| `NEXT_PUBLIC_ADMIN_EMAILS` | UI allowlist for `/admin` (comma-separated UCF emails) |

After changing env vars, **redeploy** so the build picks them up.

---

## 4. Supabase Auth URL configuration

In Supabase Dashboard → **Authentication** → **URL Configuration**:

**Site URL:**

```
https://YOUR-VERCEL-DOMAIN.vercel.app
```

**Redirect URLs** (add all that apply):

```
http://127.0.0.1:3000/auth/callback
http://localhost:3000/auth/callback
https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
```

**Preview deployments:** If you test Vercel preview links (`*.vercel.app`), add each preview callback URL, e.g.:

```
https://knight-market-git-main-yourteam.vercel.app/auth/callback
```

The host in the magic link must match a configured redirect URL. Users must request the sign-in link **from the same origin** they will land on (deployed URL, not localhost).

---

## 5. Supabase setup checklist

Before beta testing, confirm in Supabase:

- [ ] `supabase/sql/001_core_product_schema.sql` applied
- [ ] `supabase/sql/002_messaging_policy_fix.sql` applied (required for message send)
- [ ] `supabase/sql/003_moderation_reports.sql` applied (reports + admin table/function)
- [ ] Storage bucket `listing-images` exists
- [ ] Email provider enabled (Authentication → Providers → Email)
- [ ] RLS enabled on `profiles`, `listings`, `conversations`, `messages`, storage
- [ ] Your moderator account inserted into `public.admin_users`

Admin user insert:

```sql
INSERT INTO public.admin_users (user_id, email)
VALUES ('<your-auth-user-id>', 'your-email@ucf.edu')
ON CONFLICT (user_id) DO NOTHING;
```

See also:

- [supabase-auth-setup.md](./supabase-auth-setup.md)
- [supabase-core-schema-setup.md](./supabase-core-schema-setup.md)

---

## 6. Private beta test checklist

### Founder

- [ ] Open deployed site (`NEXT_PUBLIC_APP_URL`)
- [ ] Sign in with UCF email (`@ucf.edu` or `@knights.ucf.edu`)
- [ ] Complete onboarding
- [ ] Post a listing at `/sell` with a real image (JPEG/PNG/WebP)
- [ ] Confirm listing appears on `/marketplace`
- [ ] Confirm listing detail page works
- [ ] Confirm `/profile` shows your listing

### Friend (second UCF account)

- [ ] Sign in with a different UCF email
- [ ] Complete onboarding
- [ ] Open founder's listing
- [ ] Click **Message Seller**
- [ ] Send a message in `/messages`

### Founder (again)

- [ ] Open `/messages`
- [ ] See conversation and reply
- [ ] Use **Refresh** if messages do not appear immediately (no realtime yet)

### Supabase Table Editor

- [ ] `profiles` — rows for both users
- [ ] `listings` — founder's listing row
- [ ] Storage → `listing-images` — image under `{user-id}/`
- [ ] `conversations` — row with both participant IDs and `listing_id`
- [ ] `messages` — rows for sent messages
- [ ] `reports` — rows for listing/message/user reports

> You cannot message your own listing. Use **two verified UCF accounts** for full messaging tests.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Magic link redirects to `localhost` | Signed in from localhost, or Supabase Site URL is localhost | Request link from deployed URL; set Site URL to Vercel domain |
| Magic link / callback error | Redirect URL not allowlisted | Add `https://YOUR-DOMAIN/auth/callback` in Supabase |
| Auth works locally but not on Vercel | Missing or wrong env vars | Verify all five `NEXT_PUBLIC_*` vars; redeploy |
| RLS / permission errors | Schema or policies missing | Re-run `001` SQL; check user is authenticated |
| Image upload fails | Bucket missing or RLS | Confirm `listing-images` bucket; upload path `{uid}/filename` |
| Message send fails | Missing `002` policy | Run `002_messaging_policy_fix.sql` |
| Admin dashboard shows no reports access | `003` not applied or admin user not inserted | Apply `003_moderation_reports.sql`; insert your user in `public.admin_users` |
| Vercel build fails | Type/lint errors | Run `npm run quality` locally first |
| Housing/tutoring/etc. show coming soon | Expected | Only marketplace + listing messaging are wired |

**Dev routes on production:**

- `/dev/auth-diagnostics` and `/dev/error-demo` show a safe “private beta only” message (no sensitive data).
- `/qa` remains available as an internal checklist.

---

## 8. Private beta limitations

| Area | Status |
|------|--------|
| Auth (UCF email magic link) | ✅ Real |
| Marketplace listings | ✅ Real |
| Listing image upload | ✅ Real |
| Buyer–seller messaging (listings) | ✅ Real (no realtime) |
| Reports + moderation dashboard | ✅ Basic (private beta) |
| Saved listings | localStorage only |
| Housing, tutoring, jobs, events | Coming soon |
| Lost & Found, discounts | Coming soon |
| Admin moderation | Not wired |
| Payments | Not in scope |

---

## Related docs

- [supabase-auth-setup.md](./supabase-auth-setup.md)
- [supabase-core-schema-setup.md](./supabase-core-schema-setup.md)
- [backend-migration-plan.md](./backend-migration-plan.md)
