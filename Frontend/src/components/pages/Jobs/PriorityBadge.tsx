import React from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobPriority } from "@/types/job";
import { priorityColors } from "@/types/job";

const priorityLabels: Record<JobPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

interface PriorityBadgeProps {
  priority?: JobPriority | string;
  showIcon?: boolean;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority = "medium",
  showIcon = true,
  className,
}) => {
  const key = (priority as JobPriority) in priorityColors ? (priority as JobPriority) : "medium";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        priorityColors[key],
        className,
      )}
    >
      {showIcon && <Flag className="h-3 w-3" />}
      {priorityLabels[key]}
    </span>
  );
};

export default React.memo(PriorityBadge);
