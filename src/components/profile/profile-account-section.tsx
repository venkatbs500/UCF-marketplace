"use client";

import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

export function ProfileAccountSection() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <section className="mt-10" data-testid="profile-account-section">
      <h2 className="mb-3 text-lg font-semibold">Account & safety</h2>
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-medium">Verified student email</p>
              <p className="text-sm text-muted">{user.email}</p>
              {user.isVerifiedStudent && (
                <p className="mt-1 text-xs text-gold">UCF student domain verified</p>
              )}
            </div>
          </div>
          <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-muted">
            Never share passwords or payment details in chat. Meet in public campus
            locations when exchanging items.
          </p>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => signOut()}
            data-testid="profile-sign-out"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
