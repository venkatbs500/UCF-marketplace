"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ProfileTabsProps {
  reviews: Review[];
}

export function ProfileTabs({ reviews }: ProfileTabsProps) {
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

      {activeTab === "reviews" && (
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
      )}

      {activeTab === "activity" && (
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
                <p className="text-sm">{activity}</p>
                <p className="text-xs text-muted">{i + 1} days ago</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/saved">
          <Button variant="secondary">View Saved Listings</Button>
        </Link>
      </div>
    </>
  );
}
