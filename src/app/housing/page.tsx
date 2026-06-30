"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs } from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { Card } from "@/components/ui/card";
import { HousingCard } from "@/components/housing/housing-card";
import { RoommateCard } from "@/components/housing/roommate-card";
import { ApartmentReviewCard } from "@/components/housing/apartment-review-card";
import { HOUSING_TABS } from "@/lib/constants";
import {
  housingPosts,
  roommateProfiles,
  apartmentReviews,
} from "@/lib/mock-data";

export default function HousingPage() {
  const [activeTab, setActiveTab] = useState("subleases");

  const subleases = housingPosts.filter((p) => p.type === "sublease");
  const transfers = housingPosts.filter((p) => p.type === "lease-transfer");

  return (
    <AppShell>
      <SectionHeading
        title="Housing"
        subtitle="Subleases, roommates, apartment reviews, and lease transfers"
      />

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
          {activeTab === "subleases" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {subleases.map((post) => (
                <HousingCard key={post.id} post={post} />
              ))}
            </div>
          )}
          {activeTab === "roommates" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {roommateProfiles.map((profile) => (
                <RoommateCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {apartmentReviews.map((review) => (
                <ApartmentReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
          {activeTab === "transfers" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {transfers.map((post) => (
                <HousingCard key={post.id} post={post} />
              ))}
            </div>
          )}
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
