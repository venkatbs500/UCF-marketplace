import { AUTH_MODE } from "@/lib/supabase/config";
import { isRealDataMode } from "@/lib/product-mode";

/** Real messaging from Supabase (not demo mock inbox). */
export function usesSupabaseMessaging(): boolean {
  return AUTH_MODE === "supabase" && isRealDataMode();
}
