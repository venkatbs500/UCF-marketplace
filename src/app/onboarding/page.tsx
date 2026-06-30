import { OnboardingForm } from "@/components/auth/onboarding-form";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";

export default function OnboardingPage() {
  return (
    <AuthFlowGate mode="onboarding">
      <OnboardingForm />
    </AuthFlowGate>
  );
}
