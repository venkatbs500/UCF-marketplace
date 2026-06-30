import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { aiStudyTools } from "@/lib/mock-data";

export function AIPreview() {
  const tools = aiStudyTools.slice(0, 3);

  return (
    <section className="rounded-3xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-gold">AI Study Assistant</span>
          </div>
          <h2 className="text-2xl font-bold">Study smarter, not harder</h2>
          <p className="mt-1 text-sm text-muted">
            AI-powered tools built for how students actually study
          </p>
        </div>
        <Link href="/ai">
          <Button variant="outline" size="sm">
            Try AI Tools <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} hover>
            <h3 className="mb-1 text-sm font-semibold">{tool.name}</h3>
            <p className="mb-2 text-xs text-muted">{tool.description}</p>
            <span className="text-xs text-gold">
              {tool.usageCount.toLocaleString()} uses
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}
