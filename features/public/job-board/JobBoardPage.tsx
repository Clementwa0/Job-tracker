"use client";

import { useEffect, useState } from "react";
import JobBoardCard from "./components/JobBoardCard";
import { publicJobBoardService } from "./services/publicJobBoard.client";
import type { PublicJobListItem } from "@/types/jobPosting";

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<PublicJobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await publicJobBoardService.list({ sort: "newest" });
        if (!cancelled) {
          setJobs(result.jobs);
          setTotal(result.meta?.total ?? result.jobs.length);
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load job postings. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Result count */}
        {!loading && !error && (
          <p className="mb-4 text-xs text-muted-foreground">
            {total} active {total === 1 ? "role" : "roles"}
          </p>
        )}

        {error ? (
          <Empty title={error} />
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : jobs.length ? (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <JobBoardCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Empty title="No active jobs right now." />
        )}
      </div>
    </main>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center sm:p-10">
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}