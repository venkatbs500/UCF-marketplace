import { cn } from "@/lib/utils";

type UnreadBadgeProps = {
  count: number;
  className?: string;
  showCount?: boolean;
};

export function UnreadBadge({ count, className, showCount = true }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const label =
    count === 1 ? "1 unread message" : `${count > 99 ? "99+" : count} unread messages`;

  if (showCount && count > 0) {
    return (
      <span
        aria-label={label}
        className={cn(
          "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold leading-none text-black",
          className
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className={cn("h-2 w-2 rounded-full bg-gold", className)}
    />
  );
}
