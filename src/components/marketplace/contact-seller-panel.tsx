"use client";

import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedActionButton } from "@/components/auth/protected-action-button";

export function ContactSellerPanel() {
  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="mb-2 font-semibold">Contact Seller</h3>
        <p className="mb-4 text-sm text-muted">
          Message the seller to ask questions or arrange pickup. Verified students only.
        </p>
        <ProtectedActionButton className="w-full">
          <MessageCircle className="h-4 w-4" />
          Message Seller
        </ProtectedActionButton>
      </CardContent>
    </Card>
  );
}
