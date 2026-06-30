import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gold/20 text-gold border border-gold/30",
        secondary: "bg-white/10 text-foreground border border-white/10",
        success: "bg-green-500/20 text-green-400 border border-green-500/30",
        warning: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
        destructive: "bg-red-500/20 text-red-400 border border-red-500/30",
        outline: "border border-white/20 text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
