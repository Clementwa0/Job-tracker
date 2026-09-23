import React from "react";
import { Activity, Bell, FileText, RefreshCw } from "lucide-react";
import type { JobActivity } from "@/types/job";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  note: { icon: <FileText className="h-3 w-3" />, color: "bg-blue-500" },
  status: { icon: <RefreshCw className="h-3 w-3" />, color: "bg-violet-500" },
  reminder: { icon: <Bell className="h-3 w-3" />, color: "bg-amber-500" },
  system: { icon: <Activity className="h-3 w-3" />, color: "bg-muted-foreground" },
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
      <div className="py-10 text-center text-xs text-muted-foreground">
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
          <li key={entry._id ?? idx} className="relative flex gap-2.5 pb-5">
            {!isLast && (
              <span className="absolute left-[13px] top-7 bottom-0 w-px bg-border/60" />
            )}
            <div
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                cfg.color,
              )}
            >
              {cfg.icon}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-snug text-foreground">
                {entry.message}
              </p>
              {entry.createdAt && (
                <time className="mt-0.5 block text-[10.5px] text-muted-foreground">
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