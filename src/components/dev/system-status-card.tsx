import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductMode, isDemoDataEnabled, isRealDataMode } from "@/lib/product-mode";
import { usesSupabaseMarketplace } from "@/lib/marketplace-mode";

type SystemStatus = "ready" | "not-connected";

type StatusRow = {
  label: string;
  status: SystemStatus;
  detail?: string;
};

const STATUS_ROWS: StatusRow[] = [
  { label: "Frontend", status: "ready" },
  { label: "Mock Auth", status: "ready" },
  { label: "Supabase Magic Link Auth", status: "ready" },
  { label: "UCF Email Domain Guard", status: "ready" },
  { label: "Auth Callback Route", status: "ready" },
  { label: "Local Auth Test Mode", status: "ready" },
  {
    label: "Product Mode",
    status: "ready",
    detail: getProductMode(),
  },
  {
    label: "Demo Catalog Data",
    status: isDemoDataEnabled() ? "ready" : "not-connected",
    detail: isDemoDataEnabled() ? "enabled" : "disabled (real mode)",
  },
  {
    label: "Deployment Honesty (Real Mode)",
    status: isRealDataMode() ? "ready" : "ready",
    detail: isRealDataMode() ? "active" : "demo mock visible",
  },
  { label: "Coming-Soon Actions", status: "ready" },
  {
    label: "Supabase Profile Sync",
    status: usesSupabaseMarketplace() ? "ready" : "not-connected",
    detail: usesSupabaseMarketplace() ? "profiles table" : "local/demo mode",
  },
  {
    label: "Supabase Marketplace Listings",
    status: usesSupabaseMarketplace() ? "ready" : "not-connected",
    detail: usesSupabaseMarketplace() ? "listings table" : "localStorage",
  },
  {
    label: "Supabase Listing Image Upload",
    status: usesSupabaseMarketplace() ? "ready" : "not-connected",
    detail: usesSupabaseMarketplace() ? "listing-images bucket" : "emoji placeholders",
  },
  {
    label: "Owner Listing Delete",
    status: "ready",
    detail: usesSupabaseMarketplace() ? "Supabase RLS" : "local",
  },
  { label: "GitHub Actions CI", status: "ready" },
  { label: "Error Boundaries", status: "ready" },
  { label: "E2E Tests", status: "ready" },
  { label: "Backend Abstraction", status: "ready" },
  {
    label: "Real Marketplace Backend",
    status: usesSupabaseMarketplace() ? "ready" : "not-connected",
    detail: usesSupabaseMarketplace() ? "Supabase" : "localStorage in real UI",
  },
  { label: "Featured Listing Dedupe", status: "ready" },
  { label: "Type Check", status: "ready" },
  { label: "Route Smoke", status: "ready" },
  { label: "Backend Migration Plan", status: "ready" },
  {
    label: "Database",
    status: usesSupabaseMarketplace() ? "ready" : "not-connected",
    detail: usesSupabaseMarketplace() ? "schema applied" : "SQL prepared",
  },
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
            <div className="flex items-center gap-2">
              {row.detail && (
                <span className="text-xs text-muted">{row.detail}</span>
              )}
              <Badge variant={row.status === "ready" ? "success" : "secondary"}>
                {row.status === "ready" ? "Ready" : "Not connected"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
