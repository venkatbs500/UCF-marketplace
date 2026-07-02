"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import type { OnboardingData } from "@/lib/onboarding-options";
import { activeAuthService } from "@/lib/services/active-auth-service";
import { AUTH_MODE } from "@/lib/supabase/config";

type AuthContextValue = {
  user: ReturnType<typeof activeAuthService.getSession>["user"];
  pendingEmail: string | null;
  isLoading: boolean;
  authMode: "local" | "supabase";
  isAuthenticated: boolean;
  isVerifiedStudent: boolean;
  hasCompletedOnboarding: boolean;
  signInWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (
    data: OnboardingData
  ) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeNoop() {
  return () => {};
}

function getClientMounted() {
  return true;
}

function getServerMounted() {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(
    activeAuthService.subscribe,
    activeAuthService.getSessionSnapshot,
    activeAuthService.getServerSessionSnapshot
  );
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );

  const user = session.user;
  const pendingEmail = session.pendingEmail;
  const isLoading = !isMounted;

  const signInWithEmail = useCallback(
    (email: string) => activeAuthService.signInWithEmail(email),
    []
  );

  const verifyCode = useCallback(
    (code: string) => activeAuthService.verifyCode(code, pendingEmail),
    [pendingEmail]
  );

  const completeOnboarding = useCallback(
    (data: OnboardingData) => {
      const currentUser = activeAuthService.getSession().user ?? user;
      if (!currentUser) {
        return Promise.resolve({
          success: false,
          error: "No active session. Please sign in again.",
        });
      }
      return activeAuthService.completeOnboarding(currentUser, data);
    },
    [user]
  );

  const refreshSession = useCallback(
    () => activeAuthService.refreshSession(),
    []
  );

  const signOut = useCallback(() => {
    activeAuthService.signOut();
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      pendingEmail,
      isLoading,
      authMode: AUTH_MODE,
      isAuthenticated: Boolean(user?.isVerifiedStudent),
      isVerifiedStudent: Boolean(user?.isVerifiedStudent),
      hasCompletedOnboarding: Boolean(user?.hasCompletedOnboarding),
      signInWithEmail,
      verifyCode,
      completeOnboarding,
      refreshSession,
      signOut,
    }),
    [
      user,
      pendingEmail,
      isLoading,
      signInWithEmail,
      verifyCode,
      completeOnboarding,
      refreshSession,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
