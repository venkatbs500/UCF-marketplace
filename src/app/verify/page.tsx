import { VerificationCard } from "@/components/auth/verification-card";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";

export default function VerifyPage() {
  return (
    <AuthFlowGate mode="verify">
      <VerificationCard />
    </AuthFlowGate>
  );
}
