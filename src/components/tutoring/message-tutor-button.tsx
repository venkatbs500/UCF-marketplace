"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { buildOnboardingUrl, buildSignInUrl } from "@/lib/auth";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import {
  DEMO_TUTOR_CONVERSATION_ID,
  openDemoTutorConversation,
} from "@/lib/services/messaging-service";
import { getOrCreateTutorConversation } from "@/lib/services/supabase-messaging-service";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface MessageTutorButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  tutorProfileId: string;
  tutorUserId: string;
  tutorName?: string;
  redirectPath?: string;
}

export function MessageTutorButton({
  tutorProfileId,
  tutorUserId,
  tutorName,
  redirectPath,
  className,
  variant = "secondary",
  size = "default",
  ...props
}: MessageTutorButtonProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const supabaseMessaging = usesSupabaseMessaging();
  const demoMessaging = isDemoDataEnabled() && !supabaseMessaging;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnPath = redirectPath ?? `/tutoring/${tutorProfileId}`;
  const isOwner = user?.id === tutorUserId;

  if (isOwner) {
    return null;
  }

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading || loading) return;

    setError(null);

    if (!isAuthenticated) {
      router.push(buildSignInUrl(returnPath));
      return;
    }
    if (!hasCompletedOnboarding) {
      router.push(buildOnboardingUrl(returnPath));
      return;
    }
    if (!user?.id) return;

    setLoading(true);

    if (demoMessaging) {
      const demo = await openDemoTutorConversation(tutorProfileId);
      setLoading(false);
      const params = new URLSearchParams({ conversation: demo.conversationId });
      if (tutorName) params.set("tutor", tutorName);
      router.push(`/messages?${params.toString()}`);
      return;
    }

    if (!supabaseMessaging) {
      setLoading(false);
      setError("Messaging is available in Supabase real mode.");
      return;
    }

    const result = await getOrCreateTutorConversation(tutorProfileId, user.id);
    setLoading(false);

    if (!result.conversationId) {
      setError(result.error ?? "We could not open this conversation. Please try again.");
      return;
    }

    const params = new URLSearchParams({ conversation: result.conversationId });
    if (tutorName) params.set("tutor", tutorName);
    router.push(`/messages?${params.toString()}`);
  };

  if (!supabaseMessaging && !demoMessaging) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className?.includes("w-full") && "w-full")}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isLoading || loading}
        data-testid={`message-tutor-${tutorProfileId}`}
        {...props}
      >
        <MessageCircle className="h-4 w-4" />
        {loading ? "Opening chat…" : "Message tutor"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export { DEMO_TUTOR_CONVERSATION_ID };
