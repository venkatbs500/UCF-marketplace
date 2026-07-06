import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real lost & found posts from Supabase (not mock catalog). */
export function usesSupabaseLostFound(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
