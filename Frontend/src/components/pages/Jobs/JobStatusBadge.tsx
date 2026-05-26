import React from "react";
import { cn } from "@/lib/utils";
import {
  applicationStatusColors,
  type ApplicationStatus,
} from "@/types/job";

interface Props {
  status: string;
  className?: string;
}

const labelMap: Record<string, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  waiting_response: "Awaiting",
  ghosted: "Ghosted",
  accepted: "Accepted",
  completed: "Completed",
};

const JobStatusBadge: React.FC<Props> = ({ status, className }) => {
  const key = (status || "applied") as ApplicationStatus;
  const tone =
    applicationStatusColors[key] ??
    "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {labelMap[key] ?? key.replace(/_/g, " ")}
    </span>
  );
};

export default JobStatusBadge;
