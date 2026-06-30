"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth";
import { PROTECTED_ACTION_UNLOCKED_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ProtectedActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  unlockedLabel?: string;
}

export function ProtectedActionButton({
  children,
  unlockedLabel = PROTECTED_ACTION_UNLOCKED_LABEL,
  className,
  variant,
  size,
  onClick,
  disabled,
  ...props
}: ProtectedActionButtonProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [unlocked, setUnlocked] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.signIn);
      return;
    }
    if (!hasCompletedOnboarding) {
      router.push(AUTH_ROUTES.onboarding);
      return;
    }

    setUnlocked(true);
    onClick?.(event);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {unlocked ? unlockedLabel : children}
    </Button>
  );
}

export function useProtectedAction() {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [unlocked, setUnlocked] = useState(false);

  const runProtectedAction = (callback?: () => void) => {
    if (isLoading) return false;
    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.signIn);
      return false;
    }
    if (!hasCompletedOnboarding) {
      router.push(AUTH_ROUTES.onboarding);
      return false;
    }
    setUnlocked(true);
    callback?.();
    return true;
  };

  return { runProtectedAction, unlocked, isLoading };
}
