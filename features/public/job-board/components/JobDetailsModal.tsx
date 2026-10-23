"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";
import type { PublicJobDetail } from "@/types/jobPosting";
import { publicJobBoardService } from "../services/publicJobBoard.client";
import { JobActionsSidebar } from "./job-details/JobActionsSidebar";
import { JobDetailsContent } from "./job-details/JobDetailsContent";

interface JobDetailsModalProps {
  slug: string | null;
  onClose: () => void;
}

export function JobDetailsModal({ slug, onClose }: JobDetailsModalProps) {
  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slug) { setJob(null); setError(false); return; }
    let cancelled = false;
    setJob(null);
    setError(false);

    publicJobBoardService
      .get(slug)
      .then((result) => { if (!cancelled) setJob(result); })
      .catch(() => { if (!cancelled) setError(true); });

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [slug, onClose]);

  if (!mounted || !slug) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={job?.title ?? "Job details"}
        aria-busy={!job && !error ? true : undefined}
        className="flex h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl outline-none sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground hover:text-primary"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            All jobs
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error ? (
            <p role="status" className="py-16 text-center text-sm text-muted-foreground">
              This job is no longer available.
            </p>
          ) : !job ? (
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <JobDetailsContent job={job} />
              <JobActionsSidebar job={job} />
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}