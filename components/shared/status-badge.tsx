import { cn } from "@/utils";
import { getApplicationStatusConfig, getDocumentStatusConfig } from "@/utils";

interface StatusBadgeProps {
  status: string;
  type: "application" | "document";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config =
    type === "application"
      ? getApplicationStatusConfig(status)
      : getDocumentStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
