import { localMarketplaceService } from "./local-marketplace-service";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";

export { localMarketplaceService };

/** Draft + saved listings always use local storage helpers. */
export const draftMarketplaceService = localMarketplaceService;

export function getActiveMarketplaceBackend(): "local" | "supabase" {
  return usesSupabaseMarketplace() ? "supabase" : "local";
}

export { usesSupabaseMarketplace };
