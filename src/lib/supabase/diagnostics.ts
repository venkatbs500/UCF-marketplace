import {
  SUPABASE_ANON_KEY,
  SUPABASE_REACHABILITY_ERROR,
  SUPABASE_URL,
  getSupabaseConfigIssues,
} from "./config";

export type SupabaseReachabilityResult =
  | { ok: true }
  | { ok: false; message: string };

const REACHABILITY_TIMEOUT_MS = 8000;

export async function checkSupabaseReachability(): Promise<SupabaseReachabilityResult> {
  const configIssues = getSupabaseConfigIssues();
  if (configIssues.length > 0) {
    return { ok: false, message: configIssues.join(" ") };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REACHABILITY_TIMEOUT_MS);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      message: `Supabase health check returned ${response.status} ${response.statusText}.`,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        message: "Supabase health check timed out after 8 seconds.",
      };
    }

    return { ok: false, message: SUPABASE_REACHABILITY_ERROR };
  }
}
