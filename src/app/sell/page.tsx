"use client";

import { Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ListingForm } from "@/components/sell/listing-form";
import { PublishSuccessCard } from "@/components/sell/publish-success-card";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserListings } from "@/components/providers/user-listings-provider";

function SellContent() {
  const { user } = useAuth();
  const { publishSuccess, clearPublishSuccess } = useUserListings();

  if (publishSuccess) {
    return (
      <AppShell>
        <PublishSuccessCard sellerId={user?.id} />
        <button
          type="button"
          onClick={clearPublishSuccess}
          className="mt-4 block w-full text-center text-xs text-muted hover:text-foreground"
        >
          Dismiss
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionHeading
        title="Post a Listing"
        subtitle="Sell to verified students on campus"
      />

      {user?.isVerifiedStudent && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <Shield className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-medium">
              You&apos;re posting as a verified student.
            </p>
            <p className="text-xs text-muted">
              Listings from verified accounts get more trust from buyers.
            </p>
          </div>
          <Badge variant="success" className="ml-auto shrink-0">
            Verified
          </Badge>
        </div>
      )}

      <ListingForm />
    </AppShell>
  );
}

export default function SellPage() {
  return (
    <AuthGuard>
      <SellContent />
    </AuthGuard>
  );
}
