import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real campus jobs from Supabase (not mock catalog). */
export function usesSupabaseJobs(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
