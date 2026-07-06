import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real housing posts from Supabase (not mock catalog). */
export function usesSupabaseHousing(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
