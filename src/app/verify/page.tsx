import { Suspense } from "react";
import { VerificationCard } from "@/components/auth/verification-card";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function VerifyPage() {
  return (
    <AuthFlowGate mode="verify">
      <Suspense
        fallback={
          <AuthPageShell>
            <LoadingSpinner className="min-h-[40vh]" />
          </AuthPageShell>
        }
      >
        <VerificationCard />
      </Suspense>
    </AuthFlowGate>
  );
}
