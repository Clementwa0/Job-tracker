"use client";

import { useEffect, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobBoardCard from "./components/JobBoardCard";
import JobBoardFilters, { type JobBoardFilterValue } from "./components/JobBoardFilters";
import { publicJobBoardService } from "./services/publicJobBoard.client";
import type { PublicJobListItem } from "@/types/jobPosting";

const EMPTY_FILTERS: JobBoardFilterValue = {
  location: "",
  category: "all",
  jobType: "all",
  workMode: "all",
  experienceLevel: "all",
};

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<PublicJobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<JobBoardFilterValue>(EMPTY_FILTERS);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (params: { q: string; filters: JobBoardFilterValue; sort: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await publicJobBoardService.list({
        q: params.q || undefined,
        location: params.filters.location || undefined,
        category: params.filters.category === "all" ? undefined : params.filters.category,
        jobType: params.filters.jobType === "all" ? undefined : params.filters.jobType,
        workMode: params.filters.workMode === "all" ? undefined : params.filters.workMode,
        experienceLevel: params.filters.experienceLevel === "all" ? undefined : params.filters.experienceLevel,
        sort: params.sort === "salary" ? "salary" : "newest",
      });
      setJobs(result.jobs);
      setTotal(result.meta?.total ?? result.jobs.length);
    } catch {
      setError("We couldn't load job postings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load({ q, filters, sort });
    // Only on mount — subsequent loads are triggered explicitly by the
    // search form and filter interactions below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (patch: Partial<JobBoardFilterValue>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    void load({ q, filters: next, sort });
  };

  const applySort = (nextSort: string) => {
    setSort(nextSort);
    void load({ q, filters, sort: nextSort });
  };

  const clearAll = () => {
    setQ("");
    setFilters(EMPTY_FILTERS);
    setSort("newest");
    void load({ q: "", filters: EMPTY_FILTERS, sort: "newest" });
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">JobTrail opportunities</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Find work worth pursuing.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore active roles from companies hiring on JobTrail.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void load({ q, filters, sort });
          }}
          className="rounded-xl border border-border bg-card p-3 shadow-xs"
        >
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Job title, skill, or company"
              className="h-10"
            />
            <Button type="submit" className="h-10">
              <Search />
              Search jobs
            </Button>
          </div>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <JobBoardFilters value={filters} onChange={applyFilters} onClear={clearAll} />

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {loading ? "Loading…" : `${total} active ${total === 1 ? "role" : "roles"}`}
              </span>
              <SortSelect value={sort} onChange={applySort} />
            </div>

            {error ? (
              <Empty title={error} action="Try again" onClick={() => void load({ q, filters, sort })} />
            ) : loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : jobs.length ? (
              <div className="grid gap-3">
                {jobs.map((job) => (
                  <JobBoardCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Empty title="No active jobs match those filters." action="Clear filters" onClick={clearAll} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "newest")}>
      <SelectTrigger className="h-9 w-[180px]">
        <ListFilter className="mr-2 h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="salary">Salary: high to low</SelectItem>
      </SelectContent>
    </Select>
  );
}

function Empty({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Button variant="link" onClick={onClick}>
        {action}
      </Button>
    </div>
  );
}
