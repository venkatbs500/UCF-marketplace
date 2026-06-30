"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingPreviewCard } from "@/components/sell/listing-preview-card";
import { PublishSuccessCard } from "@/components/sell/publish-success-card";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { FileText } from "lucide-react";

function PreviewContent() {
  const { user } = useAuth();
  const { currentDraft, createListing, publishSuccess } = useUserListings();

  const hasDraft =
    currentDraft.title.trim() &&
    currentDraft.category &&
    currentDraft.condition &&
    currentDraft.description.trim();

  if (publishSuccess) {
    return (
      <AppShell>
        <PublishSuccessCard sellerId={user?.id} />
      </AppShell>
    );
  }

  if (!hasDraft) {
    return (
      <AppShell>
        <EmptyState
          icon={FileText}
          title="No draft to preview"
          description="Complete the sell form first to preview your listing."
          action={
            <Link href="/sell">
              <Button>Back to Sell Form</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const handlePublish = () => {
    if (user) createListing(user);
  };

  return (
    <AppShell>
      <SectionHeading
        title="Preview Listing"
        subtitle="Review everything before publishing"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ListingPreviewCard
          draft={currentDraft}
          sellerName={user?.name}
          sellerInitials={user?.avatarInitials}
        />
        <div className="space-y-4">
          <p className="text-sm text-muted">
            This is how your listing will appear in the marketplace. Publishing
            saves it locally — a real backend will sync this later.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePublish} size="lg">
              Publish Listing
            </Button>
            <Link href="/sell">
              <Button variant="secondary" size="lg">
                Edit Draft
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function SellPreviewPage() {
  return (
    <AuthGuard>
      <PreviewContent />
    </AuthGuard>
  );
}
