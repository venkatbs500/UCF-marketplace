import { localMarketplaceService } from "./local-marketplace-service";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";

export { localMarketplaceService };

/** Draft listings use local storage; saved listings use Supabase in real mode. */
export const draftMarketplaceService = localMarketplaceService;

export function getActiveMarketplaceBackend(): "local" | "supabase" {
  return usesSupabaseMarketplace() ? "supabase" : "local";
}

export { usesSupabaseMarketplace };
