"use client";

import type { Listing } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { ReportDialog } from "@/components/safety/report-dialog";
import { MessageSellerButton } from "./message-seller-button";

interface ContactSellerPanelProps {
  listing?: Listing | null;
}

export function ContactSellerPanel({ listing }: ContactSellerPanelProps) {
  const { user } = useAuth();

  if (!listing) {
    return (
      <Card>
        <CardContent className="pt-5">
          <h3 className="mb-2 font-semibold">Contact Seller</h3>
          <p className="text-sm text-muted">
            Open one of this seller&apos;s listings to start a conversation about a specific item.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="mb-2 font-semibold">Contact Seller</h3>
        <p className="mb-4 text-sm text-muted">
          Message the seller to ask questions or arrange pickup. Verified students only.
        </p>
        <MessageSellerButton
          listingId={listing.id}
          sellerId={listing.sellerId}
          listingTitle={listing.title}
          className="w-full"
          size="default"
        />
        {user?.id !== listing.sellerId && (
          <ReportDialog
            targetType="listing"
            targetId={listing.id}
            buttonLabel="Report listing"
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}
