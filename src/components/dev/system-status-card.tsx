import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SystemStatus = "ready" | "not-connected";

type StatusRow = {
  label: string;
  status: SystemStatus;
};

const STATUS_ROWS: StatusRow[] = [
  { label: "Frontend", status: "ready" },
  { label: "Mock Auth", status: "ready" },
  { label: "Mock Data", status: "ready" },
  { label: "Database", status: "not-connected" },
  { label: "Payments", status: "not-connected" },
  { label: "Real Chat", status: "not-connected" },
  { label: "AI API", status: "not-connected" },
];

export function SystemStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {STATUS_ROWS.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
          >
            <span className="text-sm font-medium">{row.label}</span>
            <Badge variant={row.status === "ready" ? "success" : "secondary"}>
              {row.status === "ready" ? "Ready" : "Not connected"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
