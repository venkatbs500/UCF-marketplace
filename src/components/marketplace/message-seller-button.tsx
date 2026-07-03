"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonAction } from "@/components/ui/coming-soon-action";
import { COMING_SOON_MESSAGES } from "@/lib/coming-soon-messages";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";
import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import { getOrCreateListingConversation } from "@/lib/services/supabase-messaging-service";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface MessageSellerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  listingId: string;
  sellerId: string;
  listingTitle?: string;
}

export function MessageSellerButton({
  listingId,
  sellerId,
  listingTitle,
  className,
  variant = "secondary",
  size = "sm",
  ...props
}: MessageSellerButtonProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const supabaseMessaging = usesSupabaseMessaging();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === sellerId;

  if (isOwner) {
    return null;
  }

  if (!supabaseMessaging) {
    return (
      <ComingSoonAction
        variant={variant}
        size={size}
        className={cn("w-full", className)}
        comingSoonMessage={COMING_SOON_MESSAGES.messageSeller}
        {...props}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Message Seller
      </ComingSoonAction>
    );
  }

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading || loading) return;

    setError(null);

    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.signIn);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.push(AUTH_ROUTES.onboarding);
      return;
    }
    if (!user?.id) return;

    setLoading(true);
    const result = await getOrCreateListingConversation(listingId, user.id);
    setLoading(false);

    if (!result.conversationId) {
      setError(result.error ?? "We could not open this conversation. Please try again.");
      return;
    }

    const params = new URLSearchParams({ conversation: result.conversationId });
    if (listingTitle) {
      params.set("listing", listingTitle);
    }
    router.push(`/messages?${params.toString()}`);
  };

  return (
    <div className={cn("space-y-2", className?.includes("w-full") && "w-full")}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isLoading || loading}
        data-testid={`message-seller-${listingId}`}
        {...props}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {loading ? "Opening chat…" : "Message Seller"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
