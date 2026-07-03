import { Suspense } from "react";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OnboardingPage() {
  return (
    <AuthFlowGate mode="onboarding">
      <Suspense
        fallback={
          <AuthPageShell>
            <LoadingSpinner className="min-h-[40vh]" />
          </AuthPageShell>
        }
      >
        <OnboardingForm />
      </Suspense>
    </AuthFlowGate>
  );
}
