import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real saved listings from Supabase (not localStorage). */
export function usesSupabaseSavedListings(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
