import type { AIStudyTool } from "@/lib/types";
import {
  FileText,
  Layers,
  Calculator,
  MessageSquare,
  FileCheck,
  Calendar,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Layers,
  Calculator,
  MessageSquare,
  FileCheck,
  Calendar,
};

interface AIToolCardProps {
  tool: AIStudyTool;
  demoMode?: boolean;
}

export function AIToolCard({ tool, demoMode = false }: AIToolCardProps) {
  const Icon = iconMap[tool.icon] || SparklesFallback;

  return (
    <Card hover className="relative">
      {tool.premium && (
        <Badge className="absolute top-3 right-3" variant="warning">
          <Lock className="mr-1 h-3 w-3" />
          Premium
        </Badge>
      )}
      <CardContent>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
          <Icon className="h-6 w-6 text-gold" />
        </div>
        <h3 className="mb-1 font-semibold">{tool.name}</h3>
        <p className="mb-3 text-sm text-muted">{tool.description}</p>
        {demoMode && (
          <span className="text-xs text-gold">
            {tool.usageCount.toLocaleString()} students used this
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function SparklesFallback({ className }: { className?: string }) {
  return <FileText className={className} />;
}
