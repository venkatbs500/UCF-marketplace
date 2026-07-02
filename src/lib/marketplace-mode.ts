import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real marketplace data from Supabase (not localStorage). */
export function usesSupabaseMarketplace(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}

export function isListingImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}
