"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { canUserDeleteListing } from "@/lib/marketplace-utils";

interface ListingOwnerActionsProps {
  listing: Listing;
  variant?: "card" | "detail" | "profile";
  onDeleted?: () => void;
}

export function ListingOwnerActions({
  listing,
  variant = "card",
  onDeleted,
}: ListingOwnerActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { deleteListing } = useUserListings();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user || !canUserDeleteListing(listing, user.id)) {
    return null;
  }

  const handleConfirmDelete = () => {
    const result = deleteListing(listing.id, user);
    setConfirmOpen(false);

    if (!result.success) {
      setConfirmOpen(false);
      return;
    }

    onDeleted?.();

    if (variant === "detail") {
      router.push("/marketplace?listingDeleted=1");
    }
  };

  const openConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmOpen(true);
  };

  if (variant === "detail") {
    return (
      <>
        <Card data-testid="listing-owner-panel">
          <CardContent className="pt-5">
            <h3 className="mb-2 font-semibold">You posted this listing</h3>
            <p className="mb-4 text-sm text-muted">
              Manage your listing here. Editing will be available in a future update.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" disabled className="w-full justify-start">
                <Pencil className="h-4 w-4" />
                Edit listing — coming soon
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={openConfirm}
                data-testid="delete-listing-button"
              >
                <Trash2 className="h-4 w-4" />
                Delete listing
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog
          open={confirmOpen}
          title="Delete listing?"
          description="This will remove your listing from Knight Market. You can post it again later."
          confirmLabel="Delete listing"
          cancelLabel="Cancel"
          confirmTestId="confirm-delete-listing"
          destructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted hover:text-red-400"
        onClick={openConfirm}
        aria-label={`Delete listing: ${listing.title}`}
        data-testid={`delete-listing-${listing.id}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete listing?"
        description="This will remove your listing from Knight Market. You can post it again later."
        confirmLabel="Delete listing"
        cancelLabel="Cancel"
        confirmTestId="confirm-delete-listing"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
