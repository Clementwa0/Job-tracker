import React from "react";
import { Activity, Bell, FileText, RefreshCw } from "lucide-react";
import type { JobActivity } from "@/types/job";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  note: { icon: <FileText className="h-3.5 w-3.5" />, color: "bg-sky-500" },
  status: { icon: <RefreshCw className="h-3.5 w-3.5" />, color: "bg-indigo-500" },
  reminder: { icon: <Bell className="h-3.5 w-3.5" />, color: "bg-amber-500" },
  system: { icon: <Activity className="h-3.5 w-3.5" />, color: "bg-slate-500" },
};

interface ActivityTimelineProps {
  activities: JobActivity[];
  className?: string;
}

const formatWhen = (d?: string) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, className }) => {
  const sorted = [...activities].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {sorted.map((entry, idx) => {
        const cfg = typeConfig[entry.type ?? "note"] ?? typeConfig.note;
        const isLast = idx === sorted.length - 1;
        return (
          <li key={entry._id ?? idx} className="relative flex gap-3 pb-6">
            {!isLast && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border/60" />
            )}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                cfg.color,
              )}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-foreground leading-snug">{entry.message}</p>
              {entry.createdAt && (
                <time className="text-xs text-muted-foreground mt-1 block">
                  {formatWhen(entry.createdAt)}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default React.memo(ActivityTimeline);
