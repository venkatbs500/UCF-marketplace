"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { completeAuthCallback, getPostLoginDestination } from "@/lib/auth-callback-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AUTH_MODE, hasSupabaseEnv } from "@/lib/supabase/config";

function AuthCallbackContent() {
  const router = useRouter();
  const started = useRef(false);
  const [label, setLabel] = useState("Finishing sign-in...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      if (AUTH_MODE !== "supabase" || !hasSupabaseEnv) {
        router.replace("/sign-in?error=missing_magic_link_code");
        return;
      }

      const client = getSupabaseBrowserClient();
      if (!client) {
        router.replace("/sign-in?error=magic_link_exchange_failed");
        return;
      }

      setLabel("Verifying your secure sign-in link...");
      const result = await completeAuthCallback(client);
      router.replace(getPostLoginDestination(result));
    }

    void run();
  }, [router]);

  return (
    <AuthPageShell>
      <LoadingSpinner className="min-h-[45vh]" label={label} />
    </AuthPageShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <LoadingSpinner className="min-h-[45vh]" label="Finishing sign-in..." />
        </AuthPageShell>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
