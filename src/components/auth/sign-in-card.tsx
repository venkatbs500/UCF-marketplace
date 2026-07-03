"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { rememberAuthRedirect } from "@/lib/auth";
import { APP_NAME, TRUST_DISCLAIMER } from "@/lib/constants";

const CALLBACK_ERROR_MESSAGE =
  "We could not complete sign-in. Please request a new link and try again.";
const MISSING_CODE_ERROR_MESSAGE =
  "This sign-in link is missing required information. Please request a new link.";

export function SignInCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, authMode } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const queryError = useMemo(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "callback") return CALLBACK_ERROR_MESSAGE;
    if (errorParam === "missing_code") return MISSING_CODE_ERROR_MESSAGE;
    return "";
  }, [searchParams]);

  const displayError = error || queryError;

  useEffect(() => {
    rememberAuthRedirect(searchParams.get("redirect"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await signInWithEmail(email);
    setLoading(false);
    if (result.success) {
      setSuccess("Check your UCF email for your secure sign-in link.");
      router.push("/verify");
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
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
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient">
            <span className="text-lg font-black text-black">KM</span>
          </div>
        </Link>
        <h1 className="mb-2 text-3xl font-bold">Welcome to {APP_NAME}</h1>
        <p className="text-sm text-muted">
          Use your UCF student email to receive a secure login link.
        </p>
      </div>

      <Card className="border-gold/20">
        <CardContent className="pt-6">
          <Badge variant="default" className="mb-4">
            <Shield className="mr-1 h-3 w-3" />
            Verified students only
          </Badge>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                UCF Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ucf.edu or you@knights.ucf.edu"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {displayError && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {displayError}
              </p>
            )}
            {success && (
              <p
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
              >
                {success}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Sending secure link..." : "Send secure sign-in link"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            We&apos;ll send a secure sign-in link to your inbox.
            {authMode === "local" && (
              <>
                {" "}
                <span className="text-gold">Demo code: 123456</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </motion.div>
  );
}
