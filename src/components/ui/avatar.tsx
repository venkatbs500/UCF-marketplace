import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ initials, size = "md", verified, className }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 font-semibold text-gold border border-gold/30",
          sizeClasses[size]
        )}
      >
        {initials}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] text-black font-bold">
          ✓
        </span>
      )}
    </div>
  );
}
