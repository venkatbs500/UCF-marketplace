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
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";
import { FileText } from "lucide-react";

function PreviewContent() {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseMarketplace();
  const {
    currentDraft,
    selectedImageFiles,
    imagePreviewUrls,
    createListing,
    publishSuccess,
    publishError,
    isPublishing,
    clearPublishSuccess,
  } = useUserListings();

  const hasDraft =
    currentDraft.title.trim() &&
    currentDraft.category &&
    currentDraft.condition &&
    currentDraft.description.trim();

  const hasImages = supabaseMode ? selectedImageFiles.length > 0 : true;

  const missingImagesAfterRefresh = supabaseMode && hasDraft && !hasImages;

  if (publishSuccess) {
    return (
      <AppShell>
        <PublishSuccessCard
          sellerId={user?.id}
          onCreateAnother={clearPublishSuccess}
          onDismiss={clearPublishSuccess}
        />
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

  if (missingImagesAfterRefresh) {
    return (
      <AppShell>
        <EmptyState
          icon={FileText}
          title="Images needed"
          description="Image files need to be selected again before publishing."
          action={
            <Link href="/sell">
              <Button>Back to images</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const handlePublish = () => {
    if (!user || publishSuccess || isPublishing) return;
    void createListing(user);
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
          previewImageUrls={supabaseMode ? imagePreviewUrls : undefined}
        />
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {supabaseMode
              ? "This is how your listing will appear in the marketplace. Publishing saves it to Knight Market."
              : "This is how your listing will appear in the marketplace. Publishing saves it locally for now."}
          </p>
          {publishError && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {publishError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handlePublish}
              size="lg"
              disabled={publishSuccess || isPublishing || !hasImages}
              data-testid="publish-listing"
            >
              {isPublishing ? "Publishing..." : "Publish Listing"}
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
