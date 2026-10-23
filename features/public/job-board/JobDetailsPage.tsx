"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { publicJobBoardService } from "./services/publicJobBoard.client";
import type { PublicJobDetail } from "@/types/jobPosting";
import { JobDetailsContent } from "./components/job-details/JobDetailsContent";
import { JobActionsSidebar } from "./components/job-details/JobActionsSidebar";

export default function JobDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    publicJobBoardService
      .get(slug)
      .then((result) => {
        if (!cancelled) setJob(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 sm:p-8">
        <Link href="/job-board" className="text-sm text-primary">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Back to jobs
        </Link>
        <p className="mt-8 text-muted-foreground">
          This job is no longer available.
        </p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 sm:p-8">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <Link
          href="/job-board"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All jobs
        </Link>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <JobDetailsContent job={job} />
          <JobActionsSidebar job={job} />
        </div>
      </div>
    </main>
  );
}