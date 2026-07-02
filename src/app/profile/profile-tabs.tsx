"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Activity } from "lucide-react";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ProfileTabsProps {
  reviews: Review[];
  demoEnabled: boolean;
}

function ComingSoonCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ProfileTabs({ reviews, demoEnabled }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <>
      <Tabs
        tabs={[
          { id: "reviews", label: "Reviews" },
          { id: "activity", label: "Activity" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === "reviews" &&
        (demoEnabled ? (
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <Avatar initials={review.reviewer.avatar} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {review.reviewer.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted">{review.comment}</p>
                        <p className="mt-2 text-xs text-muted">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="py-8 text-center text-muted">No reviews yet.</p>
            )}
          </div>
        ) : (
          <ComingSoonCard
            title="Reviews coming soon"
            description="Buyer and seller reviews will appear here once real transactions are supported."
          />
        ))}

      {activeTab === "activity" &&
        (demoEnabled ? (
          <div className="space-y-3">
            {[
              "Posted a listing on Knight Market",
              "Saved a marketplace listing",
              "Booked tutoring session with Sam Patel",
              "RSVP'd to Knight Hacks 2025",
              "Redeemed deal at Black Rock Coffee",
            ].map((activity, i) => (
              <Card key={i}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <p className="text-sm">{activity}</p>
                      <p className="text-xs text-muted">{i + 1} days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ComingSoonCard
            title="Activity history is coming soon"
            description="Your marketplace actions and campus activity will show up here in a future update."
          />
        ))}

      <div className="mt-6 text-center">
        <Link href="/saved">
          <Button variant="secondary">View Saved Listings</Button>
        </Link>
      </div>
    </>
  );
}
