"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AUTH_SIGN_IN_ERROR_CODES,
  mapSupabaseAuthErrorToSignInCode,
} from "@/lib/auth-errors";
import { getSafeRedirectPath, rememberAuthRedirect } from "@/lib/auth";

export type AuthCallbackResult =
  | { status: "success"; redirectPath: string | null }
  | { status: "error"; errorCode: string };

function readHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function readQueryRedirect(): string | null {
  if (typeof window === "undefined") return null;
  return getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
}

function buildPostLoginPath(redirectPath: string | null): string {
  return redirectPath
    ? `/auth/post-login?redirect=${encodeURIComponent(redirectPath)}`
    : "/auth/post-login";
}

function buildSignInErrorPath(errorCode: string): string {
  return `/sign-in?error=${encodeURIComponent(errorCode)}`;
}

export async function completeAuthCallback(
  client: SupabaseClient
): Promise<AuthCallbackResult> {
  const queryParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const hashParams = readHashParams();
  const redirectPath = readQueryRedirect();

  if (redirectPath) {
    rememberAuthRedirect(redirectPath);
  }

  const hashError = hashParams.get("error");
  if (hashError) {
    const description = hashParams.get("error_description") ?? hashError;
    return {
      status: "error",
      errorCode: mapSupabaseAuthErrorToSignInCode(description),
    };
  }

  const code = queryParams.get("code");
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      return {
        status: "error",
        errorCode: mapSupabaseAuthErrorToSignInCode(error.message),
      };
    }
    return { status: "success", redirectPath };
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      return {
        status: "error",
        errorCode: mapSupabaseAuthErrorToSignInCode(error.message),
      };
    }
    return { status: "success", redirectPath };
  }

  return {
    status: "error",
    errorCode: AUTH_SIGN_IN_ERROR_CODES.missingMagicLinkCode,
  };
}

export function getPostLoginDestination(result: AuthCallbackResult): string {
  if (result.status === "error") {
    return buildSignInErrorPath(result.errorCode);
  }
  return buildPostLoginPath(result.redirectPath);
}
