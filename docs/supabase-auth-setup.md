# Supabase Auth Setup

Knight Market supports Supabase magic-link email auth behind an auth mode flag.

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AUTH_MODE=supabase
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL from your Supabase dashboard.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable anon key from your Supabase dashboard.
- `NEXT_PUBLIC_AUTH_MODE`: set to `supabase` for real magic-link auth, or `local` for mock/E2E mode.

## Supabase Dashboard Settings

In Supabase Auth URL configuration:

- **Site URL**: `http://localhost:3000`
- **Redirect URL**: `http://localhost:3000/auth/callback`

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

- Site URL: your production domain
- Redirect URL: `https://<your-domain>/auth/callback`
