const FALLBACK_ADMIN_EMAIL = "admin@ucf.edu";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAdminEmailAllowlist(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const parsed = raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
  if (parsed.length === 0) {
    return [FALLBACK_ADMIN_EMAIL];
  }
  return [...new Set(parsed)];
}

export function isAdminEmailForUi(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().includes(normalizeEmail(email));
}
