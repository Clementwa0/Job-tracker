"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicJobDetail } from "@/types/jobPosting";

export function getApplyEmail(job: PublicJobDetail): string | null {
  const value = job.applyMethod?.type === "email" ? job.applyMethod.value : null;
  return typeof value === "string" && value.length > 0
    ? value.replace(/^mailto:/i, "")
    : null;
}

export function EmailApplyNotice({ job }: { job: PublicJobDetail }) {
  const [copied, setCopied] = useState(false);
  const email = getApplyEmail(job);
  if (!email) return null;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email!);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable.
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-info/20 bg-info/10 px-3 py-2.5">
      <Mail className="h-4 w-4 shrink-0 text-info" />
      <span className="text-[13px] text-foreground">
        Apply by email to <span className="font-semibold text-info">{email}</span>
        {job.applyEmailSubject && <> with the subject <span className="font-semibold text-info">{job.applyEmailSubject}</span></>}
      </span>
      <Button type="button" variant="ghost" size="sm" onClick={copyEmail} className="ml-auto h-7 gap-1 px-2 text-[11px] font-medium text-info hover:bg-info/15">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
