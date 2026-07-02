import type { AuthUser, Listing, ListingDraft, SellerProfile } from "@/lib/types";
import type { OnboardingData } from "@/lib/onboarding-options";
import type { AuthSession } from "@/lib/auth";
import type { MarketplaceFilters } from "@/lib/marketplace-utils";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export type { AuthSession, AuthUser, Listing, ListingDraft, SellerProfile, OnboardingData, MarketplaceFilters };
