export type AuthMode = "local" | "supabase";

export type SupabaseKeyType = "publishable" | "legacy-anon" | "unknown";

function normalizeAuthMode(value: string | undefined): AuthMode {
  return value?.trim().toLowerCase() === "supabase" ? "supabase" : "local";
}

export const AUTH_MODE: AuthMode = normalizeAuthMode(
  process.env.NEXT_PUBLIC_AUTH_MODE
);

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseMode = AUTH_MODE === "supabase";

export const SUPABASE_REACHABILITY_ERROR =
  "Could not reach Supabase Auth. Check your Supabase URL/key, internet connection, and Supabase status.";

export const SUPABASE_SETUP_ERROR =
  "Supabase auth mode is enabled, but NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or invalid.";

export function getSupabaseKeyType(key: string = SUPABASE_ANON_KEY): SupabaseKeyType {
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("eyJ")) return "legacy-anon";
  return "unknown";
}

export function getSupabaseUrlHost(url: string = SUPABASE_URL): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function getSupabaseConfigIssues(): string[] {
  const issues: string[] = [];

  if (!SUPABASE_URL) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
  } else {
    if (!SUPABASE_URL.startsWith("https://")) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL must start with https://.");
    }
    if (!SUPABASE_URL.includes(".supabase.co")) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL must include .supabase.co.");
    }
  }

  if (!SUPABASE_ANON_KEY) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  } else if (getSupabaseKeyType(SUPABASE_ANON_KEY) === "unknown") {
    issues.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must start with sb_publishable_ or eyJ."
    );
  }

  return issues;
}

export const hasSupabaseEnv = getSupabaseConfigIssues().length === 0;
