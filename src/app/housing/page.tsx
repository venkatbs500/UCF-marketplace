"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Home, Users, Star, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs } from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { HousingCard } from "@/components/housing/housing-card";
import { RoommateCard } from "@/components/housing/roommate-card";
import { ApartmentReviewCard } from "@/components/housing/apartment-review-card";
import { HOUSING_TABS } from "@/lib/constants";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";
import {
  housingPosts,
  roommateProfiles,
  apartmentReviews,
} from "@/lib/mock-data";
import { isDemoDataEnabledWithOverride } from "@/lib/product-mode";

function HousingTabEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <ComingSoonAction comingSoonMessage={COMING_SOON_MESSAGES.postHousing}>
            Post housing soon
          </ComingSoonAction>
          <Button variant="outline" disabled>
            Coming soon
          </Button>
        </div>
      }
    />
  );
}

function HousingPageContent() {
  const searchParams = useSearchParams();
  const demoEnabled = isDemoDataEnabledWithOverride(searchParams);
  const [activeTab, setActiveTab] = useState("subleases");

  const subleases = demoEnabled
    ? housingPosts.filter((p) => p.type === "sublease")
    : [];
  const transfers = demoEnabled
    ? housingPosts.filter((p) => p.type === "lease-transfer")
    : [];
  const roommates = demoEnabled ? roommateProfiles : [];
  const reviews = demoEnabled ? apartmentReviews : [];

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Housing"
          subtitle="Subleases, roommates, apartment reviews, and lease transfers"
        />
        <DemoModeBadge />
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search by location, price, or amenities..." />
      </div>

      <Tabs
        tabs={[...HOUSING_TABS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === "subleases" &&
            (subleases.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {subleases.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Home}
                title="No housing posts yet"
                description="Verified students will soon be able to post subleases and room openings near campus."
              />
            ))}

          {activeTab === "roommates" &&
            (roommates.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {roommates.map((profile) => (
                  <RoommateCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Users}
                title="No roommate profiles yet"
                description="Find compatible roommates once student housing profiles launch on Knight Market."
              />
            ))}

          {activeTab === "reviews" &&
            (reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ApartmentReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={Star}
                title="No apartment reviews yet"
                description="Student-written apartment reviews will help you choose where to live near UCF."
              />
            ))}

          {activeTab === "transfers" &&
            (transfers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {transfers.map((post) => (
                  <HousingCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <HousingTabEmpty
                icon={FileText}
                title="No lease transfers yet"
                description="Lease transfer posts will appear here when housing tools go live."
              />
            ))}
        </div>

        <Card className="flex h-64 flex-col items-center justify-center text-center lg:h-auto">
          <MapPin className="mb-3 h-10 w-10 text-gold/40" />
          <h3 className="mb-1 font-semibold">Campus Map</h3>
          <p className="text-sm text-muted">
            Interactive housing map coming soon. Browse listings near campus.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

export default function HousingPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <SectionHeading title="Housing" subtitle="Loading..." />
        </AppShell>
      }
    >
      <HousingPageContent />
    </Suspense>
  );
}
