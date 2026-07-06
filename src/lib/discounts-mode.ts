import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real student discounts from Supabase (not mock catalog). */
export function usesSupabaseDiscounts(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
