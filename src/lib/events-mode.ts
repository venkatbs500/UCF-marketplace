import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real campus events from Supabase (not mock catalog). */
export function usesSupabaseEvents(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
