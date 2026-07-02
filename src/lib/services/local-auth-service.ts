import type { AuthService } from "./auth-service";
import type { AuthResult, AuthSession, AuthUser, OnboardingData } from "./service-types";
import {
  applyOnboardingToUser,
  clearSession,
  createUserFromEmail,
  getServerSessionSnapshot,
  getSessionSnapshot,
  INVALID_CODE_ERROR,
  loadSession,
  MOCK_VERIFICATION_CODE,
  notifySessionChange,
  saveSession,
  subscribeSession,
} from "@/lib/auth";
import { getStudentEmailError, isAllowedStudentEmail, normalizeEmail } from "@/lib/auth-domain";

/** LocalStorage-backed auth — temporary until Supabase Auth replaces this module. */
export const localAuthService: AuthService = {
  getSession: loadSession,
  getSessionSnapshot,
  getServerSessionSnapshot,
  subscribe: subscribeSession,
  isUcfEmail: isAllowedStudentEmail,
  createUserFromEmail,

  async signInWithEmail(email: string): Promise<AuthResult> {
    const trimmed = normalizeEmail(email);
    const emailError = getStudentEmailError(trimmed);
    if (emailError) return { success: false, error: emailError };
    saveSession({ user: null, pendingEmail: trimmed });
    return { success: true };
  },

  async verifyCode(code: string, pendingEmail: string | null): Promise<AuthResult> {
    const session = loadSession();
    const email = session.pendingEmail ?? pendingEmail;
    if (!email) {
      return { success: false, error: "No pending verification. Please sign in again." };
    }
    if (code.trim() !== MOCK_VERIFICATION_CODE) {
      return { success: false, error: INVALID_CODE_ERROR };
    }
    const newUser = createUserFromEmail(email);
    saveSession({ user: newUser, pendingEmail: null });
    return { success: true };
  },

  async completeOnboarding(user: AuthUser, data: OnboardingData): Promise<AuthResult> {
    if (!data.name.trim() || !data.major.trim()) {
      return { success: false, error: "Please fill in your name and major." };
    }
    if (data.interests.length === 0) {
      return { success: false, error: "Select at least one interest." };
    }
    const updated = applyOnboardingToUser(user, data);
    saveSession({ user: updated, pendingEmail: null });
    return { success: true };
  },

  async refreshSession(): Promise<void> {
    loadSession();
    notifySessionChange();
  },

  signOut(): void {
    clearSession();
  },
};

export type { AuthSession };
