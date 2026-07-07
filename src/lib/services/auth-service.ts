import type { AuthSession, AuthUser, OnboardingData, AuthResult } from "./service-types";

/**
 * Auth service contract — swap `localAuthService` for a Supabase-backed
 * implementation without changing providers or UI components.
 */
export interface AuthService {
  getSession(): AuthSession;
  getSessionSnapshot(): AuthSession;
  getServerSessionSnapshot(): AuthSession;
  subscribe(listener: () => void): () => void;
  subscribeSessionReady(listener: () => void): () => void;
  getSessionReadySnapshot(): boolean;
  getServerSessionReadySnapshot(): boolean;
  isUcfEmail(email: string): boolean;
  signInWithEmail(email: string): Promise<AuthResult>;
  resendSignInLink(): Promise<AuthResult>;
  verifyCode(code: string, pendingEmail: string | null): Promise<AuthResult>;
  clearPendingVerification(): void;
  completeOnboarding(user: AuthUser, data: OnboardingData): Promise<AuthResult>;
  refreshSession(): Promise<void>;
  signOut(): void;
  createUserFromEmail(email: string): AuthUser;
}
