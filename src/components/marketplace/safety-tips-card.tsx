import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TIPS = [
  "Meet in public campus locations like Knights Plaza or the Student Union.",
  "Verify the item before paying — Knight Market does not handle payments yet.",
  "Never share your UCF password or financial info in chat.",
  "Report suspicious listings to help keep the community safe.",
];

export function SafetyTipsCard() {
  return (
    <Card className="border-gold/20 bg-gold/5" data-testid="safety-tips-card">
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          <h3 className="font-semibold">Safety Tips</h3>
        </div>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="text-sm text-muted">
              • {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
