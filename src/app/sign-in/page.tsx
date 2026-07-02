import { Suspense } from "react";
import { SignInCard } from "@/components/auth/sign-in-card";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SignInPage() {
  return (
    <AuthFlowGate mode="sign-in">
      <Suspense
        fallback={
          <AuthPageShell>
            <LoadingSpinner className="min-h-[40vh]" />
          </AuthPageShell>
        }
      >
        <SignInCard />
      </Suspense>
    </AuthFlowGate>
  );
}
