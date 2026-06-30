import { SignInCard } from "@/components/auth/sign-in-card";
import { AuthFlowGate } from "@/components/auth/auth-flow-gate";

export default function SignInPage() {
  return (
    <AuthFlowGate mode="sign-in">
      <SignInCard />
    </AuthFlowGate>
  );
}
