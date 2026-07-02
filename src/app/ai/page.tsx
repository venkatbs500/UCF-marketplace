"use client";

import { Sparkles, Crown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { AIToolCard } from "@/components/ai/ai-tool-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { aiStudyTools } from "@/lib/mock-data";
import { isDemoDataEnabled } from "@/lib/product-mode";

export default function AIPage() {
  const demoEnabled = isDemoDataEnabled();

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="AI Study Assistant"
          subtitle={
            demoEnabled
              ? "Study smarter with AI-powered tools built for students"
              : "AI study tools are planned — not connected in production yet"
          }
        />
        <DemoModeBadge />
      </div>

      {demoEnabled ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiStudyTools.map((tool) => (
            <AIToolCard key={tool.id} tool={tool} demoMode />
          ))}
        </div>
      ) : (
        <div className="mb-10">
          <EmptyState
            icon={Sparkles}
            title="AI study tools are coming soon"
            description="AI study tools are planned. They are not connected yet. Flashcards, summaries, math help, and interview prep will launch in a future update."
            action={
              <Button variant="outline" disabled>
                Coming soon
              </Button>
            }
          />
        </div>
      )}

      <Card className="mb-10">
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h3 className="font-semibold">Ask Anything</h3>
          </div>
          <p className="mb-4 text-sm text-muted">
            {demoEnabled
              ? "Paste lecture notes, a homework problem, or a study topic to get started."
              : "AI study tools are planned. They are not connected yet."}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Summarize my chapter 5 notes on thermodynamics..."
              className="flex-1"
              disabled={!demoEnabled}
            />
            <Button disabled>
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            {demoEnabled
              ? "AI features are not connected yet — this is a visual preview."
              : "No AI backend is connected in real product mode."}
          </p>
        </CardContent>
      </Card>

      {demoEnabled && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent>
              <Badge variant="secondary" className="mb-3">
                Free
              </Badge>
              <h3 className="mb-2 text-lg font-semibold">Free Plan</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>✓ Lecture Summarizer (5/day)</li>
                <li>✓ Flashcard Generator (10/day)</li>
                <li>✓ Study Plan Builder (3/week)</li>
                <li>✓ Basic math help</li>
              </ul>
              <Button variant="secondary" className="mt-4 w-full" disabled>
                Preview only
              </Button>
            </CardContent>
          </Card>
          <Card className="border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
            <CardContent>
              <Badge variant="default" className="mb-3">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
              <h3 className="mb-2 text-lg font-semibold">Knight Premium — $4.99/mo</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>✓ Unlimited AI tools</li>
                <li>✓ Math Explainer with step-by-step</li>
                <li>✓ Interview Prep & Resume Helper</li>
                <li>✓ Priority processing</li>
              </ul>
              <Button className="mt-4 w-full" disabled>
                Coming soon
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
