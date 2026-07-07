"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Mail, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  buildOnboardingUrl,
  buildSignInUrl,
  peekAuthRedirect,
  rememberAuthRedirect,
} from "@/lib/auth";
import {
  getSignInErrorMessage,
  isAuthRateLimitMessage,
  VERIFY_MESSAGES,
} from "@/lib/auth-errors";
import { useResendCooldown } from "@/hooks/use-resend-cooldown";
import { TRUST_DISCLAIMER } from "@/lib/constants";

export function VerificationCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    pendingEmail,
    verifyCode,
    resendSignInLink,
    clearPendingVerification,
    authMode,
  } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { secondsLeft, isCoolingDown, startCooldown } = useResendCooldown();

  const redirectPath = peekAuthRedirect();
  const signInHref = buildSignInUrl(redirectPath);
  const linkError = getSignInErrorMessage(searchParams.get("error"));

  const linkErrorMessage = useMemo(() => {
    if (!linkError) return "";
    if (isAuthRateLimitMessage(linkError)) return VERIFY_MESSAGES.rateLimit;
    if (searchParams.get("error") === "expired") return VERIFY_MESSAGES.expiredLink;
    return "";
  }, [linkError, searchParams]);

  const displayError = error || linkErrorMessage;

  useEffect(() => {
    rememberAuthRedirect(searchParams.get("redirect"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await verifyCode(code);
    setLoading(false);
    if (result.success) {
      router.push(buildOnboardingUrl(redirectPath));
    } else {
      setError(result.error ?? "Verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    if (isCoolingDown || resendLoading) return;
    setError("");
    setSuccess("");
    setResendLoading(true);
    const result = await resendSignInLink();
    setResendLoading(false);
    if (result.success) {
      setSuccess(VERIFY_MESSAGES.resendSuccess);
      startCooldown();
      return;
    }
    if (result.error) {
      if (isAuthRateLimitMessage(result.error)) {
        setError(VERIFY_MESSAGES.rateLimit);
        startCooldown();
      } else if (result.error === VERIFY_MESSAGES.missingPendingEmail) {
        setError(result.error);
      } else {
        setError(VERIFY_MESSAGES.resendFailure);
      }
    }
  };

  const handleUseDifferentEmail = () => {
    clearPendingVerification();
    router.push(signInHref);
  };

  const handleBackToSignIn = () => {
    clearPendingVerification();
    router.push(signInHref);
  };

  if (!pendingEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
        data-testid="verify-missing-email"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
            <KeyRound className="h-7 w-7 text-gold" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Check your UCF email</h1>
        </div>

        <Card className="border-gold/20">
          <CardContent className="space-y-4 pt-6">
            <p
              role="alert"
              data-testid="verify-error"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {VERIFY_MESSAGES.missingPendingEmail}
            </p>
            <Link href={signInHref} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const emailDisplay = pendingEmail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
      data-testid="verify-page"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <KeyRound className="h-7 w-7 text-gold" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Check your UCF email</h1>
        <p className="text-sm text-muted" data-testid="verify-main-copy">
          {authMode === "supabase" ? (
            <>
              We sent a secure sign-in link to{" "}
              <span className="font-medium text-foreground" data-testid="magic-link-email">
                {emailDisplay}
              </span>
              . Open the newest email link on this device when possible.
            </>
          ) : (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground" data-testid="magic-link-email">
                {emailDisplay}
              </span>
              .
            </>
          )}
        </p>
      </div>

      <Card className="border-gold/20">
        <CardContent className="pt-6">
          <Badge variant="default" className="mb-4">
            <Shield className="mr-1 h-3 w-3" />
            Email verification
          </Badge>

          {authMode === "supabase" ? (
            <div className="space-y-4" data-testid="magic-link-instructions">
              <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-3 text-sm text-foreground/90">
                <div className="mb-3 flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <p className="font-medium">
                    Open your email and tap the newest sign-in link
                  </p>
                </div>
                <ul className="space-y-1.5 pl-6 text-muted">
                  <li>Use the newest email link.</li>
                  <li>Links can expire.</li>
                  <li>Check spam or junk.</li>
                  <li>Do not request many links quickly.</li>
                </ul>
              </div>

              {displayError && (
                <p
                  role="alert"
                  data-testid="verify-error"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                >
                  {displayError}
                </p>
              )}
              {success && (
                <p
                  role="status"
                  data-testid="verify-success"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                >
                  {success}
                </p>
              )}

              <Button
                type="button"
                className="w-full"
                size="lg"
                data-testid="verify-resend-link"
                disabled={isCoolingDown || resendLoading}
                onClick={() => void handleResend()}
              >
                {resendLoading
                  ? "Sending..."
                  : isCoolingDown
                    ? `Resend available in ${secondsLeft}s`
                    : "Resend sign-in link"}
              </Button>

              {isCoolingDown && (
                <p className="text-center text-xs text-muted" data-testid="verify-resend-cooldown">
                  You can request another link in {secondsLeft} seconds.
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                data-testid="verify-use-different-email"
                onClick={handleUseDifferentEmail}
              >
                Use a different email
              </Button>

              <p className="text-center text-sm">
                <button
                  type="button"
                  className="text-gold hover:underline"
                  data-testid="verify-back-to-sign-in"
                  onClick={handleBackToSignIn}
                >
                  Back to sign in
                </button>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="mb-2 block text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-lg tracking-[0.3em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                {displayError && (
                  <p
                    role="alert"
                    data-testid="verify-error"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                  >
                    {displayError}
                  </p>
                )}
                {success && (
                  <p
                    role="status"
                    data-testid="verify-success"
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                  >
                    {success}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-4 space-y-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  data-testid="verify-resend-link"
                  disabled={isCoolingDown || resendLoading}
                  onClick={() => void handleResend()}
                >
                  {resendLoading
                    ? "Sending..."
                    : isCoolingDown
                      ? `Resend available in ${secondsLeft}s`
                      : "Resend sign-in link"}
                </Button>

                {isCoolingDown && (
                  <p className="text-center text-xs text-muted" data-testid="verify-resend-cooldown">
                    You can request another link in {secondsLeft} seconds.
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  data-testid="verify-use-different-email"
                  onClick={handleUseDifferentEmail}
                >
                  Use a different email
                </Button>
                <p className="text-center text-sm">
                  <button
                    type="button"
                    className="text-gold hover:underline"
                    data-testid="verify-back-to-sign-in"
                    onClick={handleBackToSignIn}
                  >
                    Back to sign in
                  </button>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </motion.div>
  );
}
