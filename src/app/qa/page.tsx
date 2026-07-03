import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SystemStatusCard } from "@/components/dev/system-status-card";
import { QA_CHECKLIST, QA_SUMMARY } from "@/lib/qa-checklist";
import { isDevelopmentEnvironment } from "@/lib/app-url";
import { ClipboardCheck, Info, Shield } from "lucide-react";

const STATUS_LABELS = {
  manual: "Manual",
  automated: "Automated",
  info: "Info",
} as const;

export default function QAPage() {
  const isDev = isDevelopmentEnvironment();

  return (
    <AppShell>
      <SectionHeading
        title="Developer QA Checklist"
        subtitle={
          isDev
            ? "Manual testing guide for Knight Market during frontend development"
            : "Internal QA checklist for the private beta — no secrets are shown"
        }
      />

      {!isDev && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-muted">
            This page is for founders and testers running through the private beta
            checklist. Demo emails and codes below are for local/E2E mode only — not
            production credentials.
          </p>
        </div>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-gold" />
              <h3 className="font-semibold">Quick Reference</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Demo student email</p>
                <p className="font-mono text-sm text-gold">{QA_SUMMARY.demoEmails.student}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Demo admin email</p>
                <p className="font-mono text-sm text-gold">{QA_SUMMARY.demoEmails.admin}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Verification code</p>
                <p className="font-mono text-sm text-gold">{QA_SUMMARY.demoVerificationCode}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Session key</p>
                <p className="font-mono text-sm">{QA_SUMMARY.sessionStorageKey}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Saved listings key</p>
                <p className="font-mono text-sm">{QA_SUMMARY.savedListingsKey}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">User listings key</p>
                <p className="font-mono text-sm">{QA_SUMMARY.userListingsKey}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Sample listing</p>
                <p className="font-mono text-sm text-gold">/marketplace/{QA_SUMMARY.sampleListingId}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted">Sample seller</p>
                <p className="font-mono text-sm text-gold">/sellers/{QA_SUMMARY.sampleSellerId}</p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              {QA_SUMMARY.totalSections} sections · {QA_SUMMARY.totalItems} checks.
              No backend required — use localStorage mock auth.
            </p>
          </CardContent>
        </Card>
        <SystemStatusCard />
      </div>

      <div className="space-y-8">
        {QA_CHECKLIST.map((section) => (
          <section key={section.id}>
            <div className="mb-4">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <p className="text-sm text-muted">{section.description}</p>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Card key={item.id} hover>
                  <CardContent className="py-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{item.label}</h3>
                      <Badge
                        variant={
                          item.status === "automated" ? "default" : "outline"
                        }
                      >
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                        Steps
                      </p>
                      <ol className="list-inside list-decimal space-y-1 text-sm text-muted">
                        {item.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-xl border border-gold/20 bg-gold/5 px-3 py-2">
                      <p className="text-xs font-medium text-gold">Expected</p>
                      <p className="text-sm">{item.expected}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
