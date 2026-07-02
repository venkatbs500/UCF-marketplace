"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SellerProfileHeader } from "@/components/sellers/seller-profile-header";
import { SellerTrustCard } from "@/components/sellers/seller-trust-card";
import { SellerListingsSection } from "@/components/sellers/seller-listings-section";
import { SellerReviewsSection } from "@/components/sellers/seller-reviews-section";
import { ContactSellerPanel } from "@/components/marketplace/contact-seller-panel";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { getSellerById, getListingsBySeller } from "@/lib/marketplace-utils";
import { sellerReviews } from "@/lib/mock-data";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { User } from "lucide-react";

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  const { user } = useAuth();
  const { userListings } = useUserListings();
  const seller = getSellerById(sellerId, { authUser: user, userListings });

  if (!seller) {
    return (
      <AppShell>
        <EmptyState
          icon={User}
          title="Seller not found"
          description="This seller profile doesn't exist or has been removed."
          testId="seller-not-found"
          action={
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const listings = getListingsBySeller(sellerId, userListings);
  const reviews = isDemoDataEnabled()
    ? sellerReviews.filter((r) => r.sellerId === sellerId)
    : [];

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <SellerProfileHeader seller={seller} />
          <SellerListingsSection listings={listings} />
          <SellerReviewsSection reviews={reviews} />
        </div>
        <div className="space-y-4">
          <SellerTrustCard seller={seller} />
          <ContactSellerPanel />
        </div>
      </div>
    </AppShell>
  );
}
