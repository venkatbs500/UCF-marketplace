"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import type { OnboardingData } from "@/lib/onboarding-options";
import {
  applyOnboardingToUser,
  clearSession,
  createUserFromEmail,
  getServerSessionSnapshot,
  getSessionSnapshot,
  INVALID_CODE_ERROR,
  loadSession,
  MOCK_VERIFICATION_CODE,
  saveSession,
  subscribeSession,
  UCF_EMAIL_ERROR,
  isUcfEmail,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  pendingEmail: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerifiedStudent: boolean;
  hasCompletedOnboarding: boolean;
  signInWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (
    data: OnboardingData
  ) => Promise<{ success: boolean; error?: string }>;
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
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted
  );

  const user = session.user;
  const pendingEmail = session.pendingEmail;
  const isLoading = !isMounted;

  const persist = useCallback((nextUser: AuthUser | null, nextPending: string | null) => {
    saveSession({ user: nextUser, pendingEmail: nextPending });
  }, []);

  const signInWithEmail = useCallback(
    async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        return { success: false, error: "Please enter your UCF email." };
      }
      if (!isUcfEmail(trimmed)) {
        return { success: false, error: UCF_EMAIL_ERROR };
      }
      persist(null, trimmed);
      return { success: true };
    },
    [persist]
  );

  const verifyCode = useCallback(
    async (code: string) => {
      const currentSession = loadSession();
      const email = currentSession.pendingEmail ?? pendingEmail;
      if (!email) {
        return { success: false, error: "No pending verification. Please sign in again." };
      }
      if (code.trim() !== MOCK_VERIFICATION_CODE) {
        return { success: false, error: INVALID_CODE_ERROR };
      }
      const newUser = createUserFromEmail(email);
      persist(newUser, null);
      return { success: true };
    },
    [pendingEmail, persist]
  );

  const completeOnboarding = useCallback(
    async (data: OnboardingData) => {
      const currentSession = loadSession();
      const currentUser = currentSession.user ?? user;
      if (!currentUser) {
        return { success: false, error: "No active session. Please sign in again." };
      }
      if (!data.name.trim() || !data.major.trim()) {
        return { success: false, error: "Please fill in your name and major." };
      }
      if (data.interests.length === 0) {
        return { success: false, error: "Select at least one interest." };
      }
      const updated = applyOnboardingToUser(currentUser, data);
      persist(updated, null);
      return { success: true };
    },
    [user, persist]
  );

  const signOut = useCallback(() => {
    clearSession();
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      pendingEmail,
      isLoading,
      isAuthenticated: Boolean(user?.isVerifiedStudent),
      isVerifiedStudent: Boolean(user?.isVerifiedStudent),
      hasCompletedOnboarding: Boolean(user?.hasCompletedOnboarding),
      signInWithEmail,
      verifyCode,
      completeOnboarding,
      signOut,
    }),
    [
      user,
      pendingEmail,
      isLoading,
      signInWithEmail,
      verifyCode,
      completeOnboarding,
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
