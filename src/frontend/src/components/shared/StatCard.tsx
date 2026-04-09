import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
  className?: string;
  "data-ocid"?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent = false,
  className,
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "relative rounded-xl border bg-card p-5 shadow-card overflow-hidden transition-smooth hover:shadow-elevated",
        accent && "border-primary/30 bg-primary/5",
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-muted/30 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-display font-bold tracking-tight",
              accent ? "text-primary" : "text-foreground",
            )}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trendUp ? "text-green-400" : "text-muted-foreground",
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accent
              ? "bg-primary/15 border border-primary/30 text-primary"
              : "bg-secondary border border-border text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
