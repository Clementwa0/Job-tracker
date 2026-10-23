"use client";

import { useState } from "react";
import { Bookmark, CalendarClock, Check, Copy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicJobDetail } from "@/types/jobPosting";
import { executeApply } from "@/lib/job-board/applyActions";
import { useSavedJobs } from "@/lib/savedJobs";
import AddToTrackerButton from "../AddToTrackerButton";
import { getApplyEmail } from "./EmailApplyNotice";
import { formatSalary, daysUntil, formatDate } from "@/lib/job-board/jobDetailsUtils";

export function JobActionsSidebar({ job }: { job: PublicJobDetail }) {
  const { has, toggle } = useSavedJobs();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const email = getApplyEmail(job);
  const isEmailApply = Boolean(email);
  const isClosed = job.isActive === false || job.status === "closed";
  const salary = formatSalary(job);
  const deadline = formatDate(job.applicationDeadline);
  const deadlineSoon = daysUntil(job.applicationDeadline);
  const saved = has(job.slug);

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1600);
    } catch {
      // Clipboard may be unavailable.
    }
  }

  return (
    <aside className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-6">
      {isClosed && (
        <div className="mb-3 rounded-lg border border-dashed border-border bg-muted/50 p-3 text-center text-[12px] text-muted-foreground">
          Applications closed{deadline ? ` on ${deadline}` : ""}.
        </div>
      )}

      {!isEmailApply && (
        <Button
          className="w-full"
          disabled={isClosed}
          onClick={() => executeApply(job.applyMethod, job.title, { subject: job.applyEmailSubject })}
        >
          <Send />
          {isClosed ? "Applications closed" : job.applyViaAggregator ? `Apply via ${job.source?.name || "job board"}` : "Apply on employer site"}
        </Button>
      )}

      {!isEmailApply && job.applyViaAggregator && !isClosed && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          This link opens {job.source?.name || "the job board"}, which forwards you to the employer.
        </p>
      )}

      {email && !isClosed && (
        <div className="rounded-lg border border-info/20 bg-info/10 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-info">
            <Mail className="h-3.5 w-3.5" />Apply via email
          </div>
          <p className="mt-1.5 select-all break-all text-[13px] font-semibold text-info">{email}</p>
          <div className="mt-2.5 border-t border-info/20 pt-2 text-[11px] leading-relaxed text-muted-foreground">
            Please send your application and cover letter directly to this address.
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyEmail} className="mt-3 h-8 w-full gap-1 bg-background text-[11px] font-medium hover:bg-muted">
            {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedEmail ? "Copied to clipboard" : "Copy email address"}
          </Button>
        </div>
      )}

      {deadline && !isClosed && deadlineSoon !== null && deadlineSoon <= 7 && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[11px] leading-relaxed text-warning-foreground">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
            <CalendarClock className="h-3.5 w-3.5" />Deadline
          </div>
          <p className="mt-1">
            {deadlineSoon === 0 ? "Applications close today." : deadlineSoon === 1 ? "Applications close tomorrow." : `Applications close in ${deadlineSoon} days (${deadline}).`}
          </p>
        </div>
      )}

      <Button
        variant="outline"
        className="mt-3 w-full"
        onClick={() => toggle({
          slug: job.slug,
          title: job.title,
          company: job.company?.name || "Company",
          location: job.location,
          salary: salary || undefined,
        })}
      >
        <Bookmark className={saved ? "fill-current" : ""} />
        {saved ? "Saved" : "Save job"}
      </Button>

      <AddToTrackerButton job={job} className="mt-3 w-full" size="default" />

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Applications are handled directly by the employer. JobTrail does not manage candidate applications.
      </p>
    </aside>
  );
}
