import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Description" },
  { id: 3, label: "Photos" },
  { id: 4, label: "Preview" },
];

interface SellProgressProps {
  currentStep: number;
}

export function SellProgress({ currentStep }: SellProgressProps) {
  return (
    <div className="mb-8 flex items-center justify-between gap-2">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              currentStep >= step.id
                ? "gold-gradient text-black"
                : "glass-card text-muted"
            )}
          >
            {step.id}
          </div>
          <span
            className={cn(
              "hidden text-xs font-medium sm:inline",
              currentStep >= step.id ? "text-foreground" : "text-muted"
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-1 hidden h-0.5 flex-1 sm:block",
                currentStep > step.id ? "bg-gold" : "bg-white/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
