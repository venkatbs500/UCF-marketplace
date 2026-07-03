# Supabase Auth Setup

Knight Market supports Supabase magic-link email auth behind an auth mode flag.

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PRODUCT_MODE=real
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

- `NEXT_PUBLIC_APP_URL`: Public app origin (no trailing slash). On Vercel, set to your deployed URL.

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL from your Supabase dashboard.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable anon key from your Supabase dashboard.
- `NEXT_PUBLIC_AUTH_MODE`: set to `supabase` for real magic-link auth, or `local` for mock/E2E mode.

## Supabase Dashboard Settings

In Supabase Auth URL configuration:

**Local development**

- **Site URL**: `http://localhost:3000` (or `http://127.0.0.1:3000`)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://127.0.0.1:3000/auth/callback`

**Vercel private beta** — see [private-beta-deployment.md](./private-beta-deployment.md) for full steps.

Enable an email provider in Supabase Auth settings. The default magic-link template is sufficient; no template customization is required.

## Product Rules

- Non-UCF emails are blocked in the app before any Supabase auth call.
- Allowed domains:
  - `@ucf.edu`
  - `@knights.ucf.edu`

## Local Development and Testing

- Keep Playwright/CI in local auth mode (`NEXT_PUBLIC_AUTH_MODE=local`) so E2E does not require a live Supabase project.
- Use Supabase mode for manual end-to-end auth testing with real student email accounts.

## Production Note

After deploying to Vercel, add your production app URL to Supabase Auth:

- Site URL: `https://<your-vercel-domain>.vercel.app`
- Redirect URL: `https://<your-vercel-domain>.vercel.app/auth/callback`
- Set `NEXT_PUBLIC_APP_URL` to the same origin in Vercel env vars

Full private beta guide: [private-beta-deployment.md](./private-beta-deployment.md)
