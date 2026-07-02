"use client";

import type { AuthService } from "./auth-service";
import type { AuthResult, AuthSession, AuthUser, OnboardingData } from "./service-types";
import {
  applyOnboardingToUser,
  createUserFromEmail,
  getServerSessionSnapshot,
} from "@/lib/auth";
import { getStudentEmailError, normalizeEmail } from "@/lib/auth-domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchSupabaseProfile,
  upsertSupabaseProfile,
} from "@/lib/services/supabase-marketplace-service";
import {
  getSupabaseConfigIssues,
  hasSupabaseEnv,
  SUPABASE_REACHABILITY_ERROR,
  SUPABASE_SETUP_ERROR,
} from "@/lib/supabase/config";

function mapSupabaseAuthError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    const lower = message.toLowerCase();

    if (
      lower === "load failed" ||
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("network request failed") ||
      lower.includes("network error") ||
      lower.includes("fetch failed")
    ) {
      return SUPABASE_REACHABILITY_ERROR;
    }

    if (message) return message;
  }

  return SUPABASE_REACHABILITY_ERROR;
}

const PENDING_EMAIL_KEY = "knight-market-supabase-pending-email";

let sessionCache: AuthSession = readInitialSession();
const listeners = new Set<() => void>();
let unsubscribeAuthListener: (() => void) | null = null;
let bootstrapped = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function setSession(next: AuthSession) {
  const same =
    sessionCache.user?.id === next.user?.id &&
    sessionCache.user?.email === next.user?.email &&
    sessionCache.user?.hasCompletedOnboarding === next.user?.hasCompletedOnboarding &&
    sessionCache.pendingEmail === next.pendingEmail;
  if (same) return;
  sessionCache = next;
  notify();
}

function readPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_EMAIL_KEY);
}

function writePendingEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) localStorage.setItem(PENDING_EMAIL_KEY, email);
  else localStorage.removeItem(PENDING_EMAIL_KEY);
}

function readInitialSession(): AuthSession {
  return { user: null, pendingEmail: readPendingEmail() };
}

async function resolveAuthUser(email: string, userId: string): Promise<AuthUser> {
  const profile = await fetchSupabaseProfile(userId, email);
  if (profile) return profile;

  const base = createUserFromEmail(email);
  return {
    ...base,
    id: userId,
    hasCompletedOnboarding: false,
    isVerifiedStudent: !getStudentEmailError(email),
  };
}

async function refreshSessionFromSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    setSession({ user: null, pendingEmail: readPendingEmail() });
    return;
  }

  const { data } = await client.auth.getSession();
  const email = data.session?.user?.email ? normalizeEmail(data.session.user.email) : null;
  const userId = data.session?.user?.id ?? null;

  if (!email || !userId) {
    setSession({ user: null, pendingEmail: readPendingEmail() });
    return;
  }

  writePendingEmail(null);
  setSession({
    user: await resolveAuthUser(email, userId),
    pendingEmail: null,
  });
}

function ensureAuthSubscription() {
  if (unsubscribeAuthListener || typeof window === "undefined") return;
  const client = getSupabaseBrowserClient();
  if (!client) return;

  const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
    const email = nextSession?.user?.email ? normalizeEmail(nextSession.user.email) : null;
    const userId = nextSession?.user?.id ?? null;
    if (!email || !userId) {
      setSession({ user: null, pendingEmail: readPendingEmail() });
      return;
    }
    writePendingEmail(null);
    void resolveAuthUser(email, userId).then((user) => {
      setSession({
        user,
        pendingEmail: null,
      });
    });
  });

  unsubscribeAuthListener = () => data.subscription.unsubscribe();
}

export const supabaseAuthService: AuthService = {
  getSession: () => sessionCache,
  getSessionSnapshot: () => sessionCache,
  getServerSessionSnapshot,
  isUcfEmail: (email: string) => !getStudentEmailError(email),
  createUserFromEmail,
  subscribe(listener: () => void) {
    listeners.add(listener);
    ensureAuthSubscription();
    if (!bootstrapped) {
      bootstrapped = true;
      void refreshSessionFromSupabase();
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && unsubscribeAuthListener) {
        unsubscribeAuthListener();
        unsubscribeAuthListener = null;
      }
    };
  },
  async signInWithEmail(email: string): Promise<AuthResult> {
    const normalized = normalizeEmail(email);
    const emailError = getStudentEmailError(normalized);
    if (emailError) return { success: false, error: emailError };
    const configIssues = getSupabaseConfigIssues();
    if (!hasSupabaseEnv || configIssues.length > 0) {
      return {
        success: false,
        error: configIssues[0] ?? SUPABASE_SETUP_ERROR,
      };
    }

    const client = getSupabaseBrowserClient();
    if (!client || typeof window === "undefined") {
      return { success: false, error: SUPABASE_SETUP_ERROR };
    }

    const redirectTo = `${window.location.origin}/auth/callback`;

    try {
      const { error } = await client.auth.signInWithOtp({
        email: normalized,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }
    } catch (error) {
      return { success: false, error: mapSupabaseAuthError(error) };
    }

    writePendingEmail(normalized);
    setSession({ user: sessionCache.user, pendingEmail: normalized });
    return { success: true };
  },
  async verifyCode(): Promise<AuthResult> {
    if (!hasSupabaseEnv) return { success: false, error: SUPABASE_SETUP_ERROR };
    return {
      success: false,
      error: "Magic-link verification is handled from your email. Please open the secure sign-in link.",
    };
  },
  async refreshSession(): Promise<void> {
    await refreshSessionFromSupabase();
  },

  async completeOnboarding(user: AuthUser, data: OnboardingData): Promise<AuthResult> {
    if (!data.name.trim() || !data.major.trim()) {
      return { success: false, error: "Please fill in your name and major." };
    }
    if (data.interests.length === 0) {
      return { success: false, error: "Select at least one interest." };
    }
    const updated = applyOnboardingToUser(user, data);
    const result = await upsertSupabaseProfile(updated);
    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error ?? "We could not save your profile. Please try again.",
      };
    }
    setSession({ user: result.user, pendingEmail: readPendingEmail() });
    return { success: true };
  },
  signOut(): void {
    const client = getSupabaseBrowserClient();
    writePendingEmail(null);
    setSession({ user: null, pendingEmail: null });
    if (client) {
      void client.auth.signOut();
    }
  },
};
