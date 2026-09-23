"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, Video, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Interview } from "@/types/interview";
import { isPopulatedJobId } from "@/types/interview";
import EditInterviewModal from "./EditInterviewModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export type InterviewCategory = "upcoming" | "completed" | "rescheduled" | "cancelled";

const CATEGORY_CHIP: Record<InterviewCategory, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rescheduled: { label: "Rescheduled", className: "bg-gold/15 text-gold-foreground dark:text-gold" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

const toSentenceCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const modeInfo = (location: string) => {
  const loc = (location || "").toLowerCase();
  if (/zoom|meet|teams|video|call|online/.test(loc)) {
    return { label: "Video Call", icon: Video };
  }
  if (!loc) return { label: "TBD", icon: MapPin };
  return { label: location, icon: MapPin };
};

type Props = {
  interview: Interview & { _date: Date };
  category: InterviewCategory;
  onRefresh?: () => void;
};

const InterviewRow = ({ interview, category, onRefresh }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const company = isPopulatedJobId(interview.jobId) ? interview.jobId.companyName : "Unknown company";
  const title = isPopulatedJobId(interview.jobId) ? interview.jobId.jobTitle : "Job details unavailable";
  const chip = CATEGORY_CHIP[category];
  const mode = modeInfo(interview.location);
  const ModeIcon = mode.icon;
  const isValidDate = !isNaN(interview._date.getTime());

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
        <Avatar className="h-11 w-11 shrink-0 rounded-xl">
          <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-semibold text-primary">
            {company.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {toSentenceCase(interview.stage)} Interview
          </p>
          <p className="truncate text-xs text-muted-foreground">{title !== company ? `${company}` : company}</p>
          {isPopulatedJobId(interview.jobId) && title && (
            <p className="truncate text-[11px] text-muted-foreground/80">{title}</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {isValidDate
                ? interview._date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Invalid date"}
            </span>
            {isValidDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {interview._date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <ModeIcon className="h-3 w-3" />
              {mode.label}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${chip.className}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {chip.label}
          </span>

          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditOpen(true)}>
              {category === "completed" ? "View Feedback" : "View Details"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Interview actions"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)} className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditInterviewModal open={editOpen} onOpenChange={setEditOpen} interview={interview} onSuccess={onRefresh} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        interviewId={interview._id}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default InterviewRow;
