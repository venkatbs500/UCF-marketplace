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

- `NEXT_PUBLIC_APP_URL`: Public app origin (no trailing slash). On Vercel production, set to `https://ucf-marketplace.vercel.app`.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL from your Supabase dashboard.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable anon key from your Supabase dashboard.
- `NEXT_PUBLIC_AUTH_MODE`: set to `supabase` for real magic-link auth, or `local` for mock/E2E mode.

## Supabase Dashboard Settings

In Supabase Dashboard → **Authentication** → **URL Configuration**:

**Site URL**

```
https://ucf-marketplace.vercel.app
```

**Redirect URLs** (add all that apply):

```
https://ucf-marketplace.vercel.app/auth/callback
http://127.0.0.1:3000/auth/callback
http://localhost:3000/auth/callback
```

For local development, you can set Site URL to `http://127.0.0.1:3000` or `http://localhost:3000` instead.

Magic links must return to `/auth/callback` — not the site root. Knight Market sets `emailRedirectTo` to `${NEXT_PUBLIC_APP_URL}/auth/callback` when sending OTP emails.

Enable an email provider in Supabase Auth settings. The default magic-link template is sufficient; no template customization is required.

## Custom SMTP for beta auth emails

Supabase’s built-in email sender has a very low rate limit (about **2 emails per hour** on the free tier). For private beta testing with multiple UCF students, configure **custom SMTP** so sign-in emails deliver reliably.

**Recommended beta provider:** [Resend](https://resend.com)

### Resend SMTP credentials

| Field | Value |
|-------|--------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your `RESEND_API_KEY` |

### Supabase location

Supabase Dashboard → **Authentication** → **Emails** → **SMTP Settings**

Enable custom SMTP and enter the Resend credentials above.

### Sender identity

| Field | Example |
|-------|---------|
| Sender email | `no-reply@YOURDOMAIN.com` |
| Sender name | `Knight Market` |

You must **verify your sending domain in Resend** before production use. Do not commit API keys to the repo — store `RESEND_API_KEY` only in Resend and paste it into Supabase SMTP password field.

### After SMTP setup

1. Send a test magic link from `/sign-in` on production.
2. Confirm the link targets `https://ucf-marketplace.vercel.app/auth/callback`.
3. Open the link on mobile and desktop to verify sign-in completes.

## Product Rules

- Non-UCF emails are blocked in the app before any Supabase auth call.
- Allowed domains:
  - `@ucf.edu`
  - `@knights.ucf.edu`

## Local Development and Testing

- Keep Playwright/CI in local auth mode (`NEXT_PUBLIC_AUTH_MODE=local`) so E2E does not require a live Supabase project.
- Use Supabase mode for manual end-to-end auth testing with real student email accounts.

## Production Note

After deploying to Vercel, confirm:

- `NEXT_PUBLIC_APP_URL=https://ucf-marketplace.vercel.app`
- Supabase Site URL: `https://ucf-marketplace.vercel.app`
- Supabase Redirect URL: `https://ucf-marketplace.vercel.app/auth/callback`
- Custom SMTP configured (see above) for reliable delivery

Full private beta guide: [private-beta-deployment.md](./private-beta-deployment.md)
