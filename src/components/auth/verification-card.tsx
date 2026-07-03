"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { buildOnboardingUrl, peekAuthRedirect } from "@/lib/auth";
import { TRUST_DISCLAIMER } from "@/lib/constants";

export function VerificationCard() {
  const router = useRouter();
  const { pendingEmail, verifyCode, authMode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyCode(code);
    setLoading(false);
    if (result.success) {
      router.push(buildOnboardingUrl(peekAuthRedirect()));
    } else {
      setError(result.error ?? "Verification failed. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <KeyRound className="h-7 w-7 text-gold" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Check your UCF email</h1>
        <p className="text-sm text-muted">
          {authMode === "supabase" ? (
            <>
              We sent a secure sign-in link to{" "}
              <span className="font-medium text-foreground">
                {pendingEmail ?? "your UCF email"}
              </span>
              .
            </>
          ) : (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">
                {pendingEmail ?? "your UCF email"}
              </span>
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
            <div className="space-y-4">
              <p className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-foreground/90">
                We sent a secure sign-in link to your UCF email. Click the link in your email to
                continue.
              </p>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
              >
                Back to sign-in
              </Link>
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

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted">
                Didn&apos;t get it?{" "}
                <Link href="/sign-in" className="text-gold hover:underline">
                  Try a different email
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </motion.div>
  );
}
