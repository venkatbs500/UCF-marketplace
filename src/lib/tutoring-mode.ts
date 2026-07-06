import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real tutoring profiles from Supabase (not mock catalog). */
export function usesSupabaseTutoring(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
