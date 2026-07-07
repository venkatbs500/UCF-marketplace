export const AUTH_SIGN_IN_ERROR_CODES = {
  missingMagicLinkCode: "missing_magic_link_code",
  magicLinkExchangeFailed: "magic_link_exchange_failed",
  expired: "expired",
  emailRateLimit: "email_rate_limit",
  /** @deprecated Use missingMagicLinkCode */
  missingCode: "missing_code",
  /** @deprecated Use magicLinkExchangeFailed */
  callback: "callback",
} as const;

export type AuthSignInErrorCode =
  (typeof AUTH_SIGN_IN_ERROR_CODES)[keyof typeof AUTH_SIGN_IN_ERROR_CODES];

const SIGN_IN_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_SIGN_IN_ERROR_CODES.missingMagicLinkCode]:
    "Your sign-in link was incomplete or expired. Please request a new link from this device.",
  [AUTH_SIGN_IN_ERROR_CODES.magicLinkExchangeFailed]:
    "We could not finish signing you in. Please request a new link.",
  [AUTH_SIGN_IN_ERROR_CODES.expired]:
    "That sign-in link expired. Please request a fresh link.",
  [AUTH_SIGN_IN_ERROR_CODES.emailRateLimit]:
    "Too many sign-in emails were requested. Please wait a bit and try again.",
  [AUTH_SIGN_IN_ERROR_CODES.missingCode]:
    "Your sign-in link was incomplete or expired. Please request a new link from this device.",
  [AUTH_SIGN_IN_ERROR_CODES.callback]:
    "We could not finish signing you in. Please request a new link.",
};

export function getSignInErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return SIGN_IN_ERROR_MESSAGES[code] ?? null;
}

export const VERIFY_MESSAGES = {
  missingPendingEmail:
    "We do not know which email to resend to. Please enter your UCF email again.",
  resendSuccess: "New sign-in link sent. Use the newest email link.",
  resendFailure: "We could not send a new link. Please wait and try again.",
  rateLimit:
    "Too many sign-in emails were requested. Please wait before requesting another link.",
  expiredLink:
    "That sign-in link expired or was incomplete. Please request a fresh link.",
} as const;

export function isAuthRateLimitMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("too many sign-in emails")
  );
}

export function mapSupabaseAuthErrorToSignInCode(message: string): AuthSignInErrorCode {
  const lower = message.toLowerCase();

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("email rate limit")
  ) {
    return AUTH_SIGN_IN_ERROR_CODES.emailRateLimit;
  }

  if (
    lower.includes("expired") ||
    lower.includes("invalid or has expired") ||
    lower.includes("otp_expired")
  ) {
    return AUTH_SIGN_IN_ERROR_CODES.expired;
  }

  return AUTH_SIGN_IN_ERROR_CODES.magicLinkExchangeFailed;
}
