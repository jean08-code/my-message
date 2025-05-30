import { cn } from "@/lib/utils";
import type { UserStatus } from "@/lib/types";

interface PresenceIndicatorProps {
  status: UserStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PresenceIndicator({ status, className, size = 'md' }: PresenceIndicatorProps) {
  const statusColors: Record<UserStatus, string> = {
    online: "bg-accent", // Using accent color as per request for active status
    offline: "bg-gray-400",
    away: "bg-yellow-400",
    dnd: "bg-red-500",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  }

  return (
    <span
      title={`Status: ${status}`}
      className={cn(
        "rounded-full border-2 border-background",
        statusColors[status],
        sizeClasses[size],
        className
      )}
      aria-label={`User status: ${status}`}
    />
  );
}
