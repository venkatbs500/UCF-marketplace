"use client";

import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";

export function ContactSellerPanel() {
  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="mb-2 font-semibold">Contact Seller</h3>
        <p className="mb-4 text-sm text-muted">
          Message the seller to ask questions or arrange pickup. Verified students only.
        </p>
        <ComingSoonAction
          className="w-full"
          comingSoonMessage={COMING_SOON_MESSAGES.messageSeller}
        >
          <MessageCircle className="h-4 w-4" />
          Message Seller
        </ComingSoonAction>
      </CardContent>
    </Card>
  );
}
