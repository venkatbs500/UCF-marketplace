import type { AuthUser } from "./types";
import type { OnboardingData } from "./onboarding-options";

export const SESSION_STORAGE_KEY = "knight-market-session";
export const MOCK_VERIFICATION_CODE = "123456";

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  verify: "/verify",
  onboarding: "/onboarding",
  marketplace: "/marketplace",
} as const;

export type AuthFlowMode = "sign-in" | "verify" | "onboarding";

export type AuthDestinationInput = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  pendingEmail: string | null;
  mode: AuthFlowMode;
};

/** Returns a redirect path when the user should not see the current auth screen */
export function getAuthDestination({
  isAuthenticated,
  hasCompletedOnboarding,
  pendingEmail,
  mode,
}: AuthDestinationInput): string | null {
  if (isAuthenticated && hasCompletedOnboarding) {
    return AUTH_ROUTES.marketplace;
  }

  if (mode === "sign-in") {
    if (isAuthenticated) return AUTH_ROUTES.onboarding;
    if (pendingEmail) return AUTH_ROUTES.verify;
    return null;
  }

  if (mode === "verify") {
    if (!pendingEmail && !isAuthenticated) return AUTH_ROUTES.signIn;
    if (isAuthenticated) return AUTH_ROUTES.onboarding;
    return null;
  }

  if (mode === "onboarding") {
    if (!isAuthenticated) return AUTH_ROUTES.signIn;
    return null;
  }

  return null;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.avatarInitials === "string" &&
    typeof user.isVerifiedStudent === "boolean" &&
    typeof user.hasCompletedOnboarding === "boolean" &&
    Array.isArray(user.interests)
  );
}

function parseAuthSession(raw: string): AuthSession {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") return EMPTY_SESSION;

  const data = parsed as Record<string, unknown>;
  const user = isAuthUser(data.user) ? data.user : null;
  const pendingEmail =
    typeof data.pendingEmail === "string" ? data.pendingEmail : null;

  return { user, pendingEmail };
}

export type AuthSession = {
  user: AuthUser | null;
  pendingEmail: string | null;
};

const EMPTY_SESSION: AuthSession = {
  user: null,
  pendingEmail: null,
};

export function isUcfEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized.endsWith("@ucf.edu") || normalized.endsWith("@knights.ucf.edu")
  );
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase().includes("admin");
}

export function getInitialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "KM";
  const parts = local.replace(/[._-]/g, " ").split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function loadSession(): AuthSession {
  if (typeof window === "undefined") return EMPTY_SESSION;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return EMPTY_SESSION;
    return parseAuthSession(raw);
  } catch {
    return EMPTY_SESSION;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  notifySessionChange();
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  notifySessionChange();
}

export function notifySessionChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("knight-market-session-change"));
}

export function subscribeSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("knight-market-session-change", handler);
  return () => window.removeEventListener("knight-market-session-change", handler);
}

export function getSessionSnapshot(): AuthSession {
  return loadSession();
}

export function getServerSessionSnapshot(): AuthSession {
  return EMPTY_SESSION;
}


export function createUserFromEmail(email: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    id: `user-${Date.now()}`,
    name: "",
    email: normalizedEmail,
    avatarInitials: getInitialsFromEmail(normalizedEmail),
    major: "",
    year: "",
    campusArea: "",
    interests: [],
    trustScore: 50,
    isVerifiedStudent: true,
    hasCompletedOnboarding: false,
    joinedAt: new Date().toISOString().split("T")[0],
  };
}

export function applyOnboardingToUser(
  user: AuthUser,
  data: OnboardingData
): AuthUser {
  return {
    ...user,
    name: data.name.trim(),
    major: data.major.trim(),
    year: data.year,
    campusArea: data.campusArea,
    interests: data.interests,
    avatarInitials: getInitialsFromName(data.name),
    hasCompletedOnboarding: true,
    trustScore: 75,
    bio: `${data.year} studying ${data.major} near ${data.campusArea}.`,
  };
}

export const UCF_EMAIL_ERROR =
  "Knight Market is currently limited to UCF student emails.";

export const INVALID_CODE_ERROR = "Invalid verification code. Please try again.";
