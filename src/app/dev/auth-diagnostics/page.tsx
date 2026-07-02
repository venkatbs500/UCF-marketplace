"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TRUST_DISCLAIMER } from "@/lib/constants";
import { useAuth } from "@/components/providers/auth-provider";
import { getEmailDomain } from "@/lib/auth-domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  AUTH_MODE,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getSupabaseConfigIssues,
  getSupabaseKeyType,
  getSupabaseUrlHost,
} from "@/lib/supabase/config";
import {
  checkSupabaseReachability,
  type SupabaseReachabilityResult,
} from "@/lib/supabase/diagnostics";

function formatKeyType(type: ReturnType<typeof getSupabaseKeyType>): string {
  switch (type) {
    case "publishable":
      return "publishable";
    case "legacy-anon":
      return "legacy anon";
    default:
      return "unknown";
  }
}

export default function AuthDiagnosticsPage() {
  const isDev = process.env.NODE_ENV === "development";
  const { refreshSession, isAuthenticated } = useAuth();
  const [reachability, setReachability] = useState<SupabaseReachabilityResult | null>(
    null
  );
  const [checking, setChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseSessionExists, setSupabaseSessionExists] = useState(false);
  const [sessionEmailDomain, setSessionEmailDomain] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/auth/callback";
    return `${window.location.origin}/auth/callback`;
  }, []);

  const configIssues = getSupabaseConfigIssues();

  const readSupabaseSession = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { exists: false, domain: null as string | null };
    }

    const { data } = await client.auth.getSession();
    const email = data.session?.user?.email ?? null;
    return {
      exists: Boolean(data.session?.user),
      domain: email ? getEmailDomain(email) : null,
    };
  }, []);

  async function applySessionStatus() {
    const result = await readSupabaseSession();
    setSupabaseSessionExists(result.exists);
    setSessionEmailDomain(result.domain);
  }

  async function handleReachabilityCheck() {
    setChecking(true);
    setReachability(null);
    const result = await checkSupabaseReachability();
    setReachability(result);
    setChecking(false);
  }

  async function handleRefreshSession() {
    setRefreshing(true);
    await refreshSession();
    await applySessionStatus();
    setRefreshing(false);
  }

  if (!isDev) {
    return (
      <AppShell>
        <Card className="mx-auto max-w-lg">
          <CardContent className="py-10 text-center">
            <h1 className="mb-2 text-xl font-bold">Development only</h1>
            <p className="mb-6 text-sm text-muted">
              Auth diagnostics are available in local development only.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <p className="mt-6 text-xs text-muted">{TRUST_DISCLAIMER}</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-6 py-10">
          <div>
            <h1 className="text-xl font-bold">Supabase Auth Diagnostics</h1>
            <p className="mt-2 text-sm text-muted">
              Safe configuration checks for magic-link sign-in. No secrets are displayed.
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">NEXT_PUBLIC_AUTH_MODE</dt>
              <dd className="font-medium">{AUTH_MODE}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">NEXT_PUBLIC_SUPABASE_URL</dt>
              <dd className="font-medium">{SUPABASE_URL ? "set" : "missing"}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">Supabase URL host</dt>
              <dd className="font-medium">{getSupabaseUrlHost() ?? "invalid"}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">NEXT_PUBLIC_SUPABASE_ANON_KEY</dt>
              <dd className="font-medium">{SUPABASE_ANON_KEY ? "set" : "missing"}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">Key type</dt>
              <dd className="font-medium">{formatKeyType(getSupabaseKeyType())}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">Expected callback URL</dt>
              <dd className="break-all text-right font-medium">{callbackUrl}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">Supabase session</dt>
              <dd className="font-medium">
                {supabaseSessionExists ? "active" : "none"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">Session email domain</dt>
              <dd className="font-medium">{sessionEmailDomain ?? "n/a"}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/5 px-4 py-3">
              <dt className="text-muted">App auth state</dt>
              <dd className="font-medium">{isAuthenticated ? "authenticated" : "signed out"}</dd>
            </div>
          </dl>

          {configIssues.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
            >
              <p className="mb-2 font-medium">Configuration issues</p>
              <ul className="list-disc space-y-1 pl-5">
                {configIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReachabilityCheck} disabled={checking}>
                {checking ? "Checking..." : "Check Supabase reachability"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshSession}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh session"}
              </Button>
            </div>

            {reachability && (
              <p
                role="status"
                className={`rounded-xl border px-4 py-3 text-sm ${
                  reachability.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {reachability.ok
                  ? "Supabase Auth is reachable."
                  : reachability.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="outline">Back to sign-in</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Go Home</Button>
            </Link>
          </div>

          <p className="text-xs text-muted">{TRUST_DISCLAIMER}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
