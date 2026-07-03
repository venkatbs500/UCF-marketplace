import { AUTH_MODE } from "./supabase/config";
import { isRealDataMode } from "./product-mode";

const FALLBACK_ADMIN_EMAIL = "admin@ucf.edu";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isSupabaseRealMode(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}

export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const parsed = raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);

  if (parsed.length > 0) return [...new Set(parsed)];

  // Keep legacy local/demo fallback for tests and local development ergonomics.
  if (!isSupabaseRealMode()) return [FALLBACK_ADMIN_EMAIL];

  return [];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(normalizeEmail(email));
}

export function getAdminDebugInfo(email: string | null | undefined) {
  const normalizedCurrentEmail = email ? normalizeEmail(email) : null;
  const adminEmails = getAdminEmails();
  const hasConfiguredEnv = Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.trim());

  return {
    currentEmail: email ?? null,
    normalizedCurrentEmail,
    hasConfiguredEnv,
    adminEmailCount: adminEmails.length,
    matchedAllowlist:
      normalizedCurrentEmail !== null && adminEmails.includes(normalizedCurrentEmail),
    isSupabaseRealMode: isSupabaseRealMode(),
  };
}

// Backward compatible alias used by existing callers.
export const isAdminEmailForUi = isAdminEmail;
