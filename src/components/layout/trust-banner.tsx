import { Shield } from "lucide-react";
import { TRUST_DISCLAIMER } from "@/lib/constants";

export function TrustBanner() {
  return (
    <div className="border-b border-white/5 bg-gold/5 px-4 py-2 text-center text-xs text-muted">
      <Shield className="mr-1 inline h-3 w-3 text-gold" />
      Verified students only · UCF email required ·{" "}
      <span className="text-gold/80">{TRUST_DISCLAIMER}</span>
    </div>
  );
}
