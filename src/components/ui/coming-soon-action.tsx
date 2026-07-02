"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ComingSoonActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  comingSoonMessage: string;
}

export function ComingSoonAction({
  children,
  comingSoonMessage,
  className,
  variant,
  size,
  disabled,
  ...props
}: ComingSoonActionProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading || disabled) return;

    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.signIn);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.push(AUTH_ROUTES.onboarding);
      return;
    }

    setShowMessage(true);
  };

  return (
    <div className={cn("space-y-2", className?.includes("w-full") && "w-full")}>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isLoading || disabled}
        {...props}
      >
        {children}
      </Button>
      {showMessage && (
        <p
          role="status"
          className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-foreground/90"
        >
          {comingSoonMessage}
        </p>
      )}
    </div>
  );
}
