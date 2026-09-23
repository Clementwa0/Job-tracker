"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useJobsList } from "@/features/jobseeker/jobs/hooks/useJobsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import type { Job, JobFilters } from "@/types/job";

import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import JobCard from "./JobCard";
import JobsEmptyState from "./JobsEmptyState";
import { JobsGridSkeleton, JobsTableSkeleton } from "./JobsSkeleton";
import JobDetailsDrawer from "./JobDetailsDrawer";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const Jobs: React.FC = () => {
  const { deleteJob } = useJobs();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter, sort]);

  const filters = useMemo<JobFilters>(() => {
    const f: JobFilters = { page, limit: PAGE_SIZE, sort };
    if (debouncedSearch.trim()) f.q = debouncedSearch.trim();
    if (statusFilter) f.status = [statusFilter];
    if (priorityFilter) f.priority = [priorityFilter as "low" | "medium" | "high" | "urgent"];
    return f;
  }, [debouncedSearch, statusFilter, priorityFilter, sort, page]);

  const { jobs, meta, isLoading, isFetching, refetch } = useJobsList(filters);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleEdit = (id: string) => router.push(`/jobseeker/applications/edit/${id}`);
  const handleDelete = async (id: string) => {
    await deleteJob(id);
    if (selectedJob?.id === id) setSelectedJob(null);
    refetch();
  };
  const handleAdd = () => router.push("/jobseeker/applications/add");

  const hasFilters = !!searchTerm || !!statusFilter || !!priorityFilter;
  const showSkeleton = isLoading && jobs.length === 0;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            My Applications
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track applications, interviews and deadlines in one place.
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-1.5 self-start shadow-sm sm:self-auto">
          <Plus className="h-3.5 w-3.5" />
          Add application
        </Button>
      </header>

      {(showSkeleton || meta.total > 0 || hasFilters) && (
        <JobsFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={meta.total}
          filteredCount={jobs.length}
          isFetching={isFetching}
        />
      )}

      <section
        aria-live="polite"
        className={cn(isFetching && !showSkeleton && "opacity-70 transition-opacity")}
      >
        {showSkeleton ? (
          viewMode === "table" ? <JobsTableSkeleton /> : <JobsGridSkeleton />
        ) : jobs.length === 0 ? (
          <JobsEmptyState
            hasFilters={hasFilters}
            onAdd={handleAdd}
            onClearFilters={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPriorityFilter("");
            }}
          />
        ) : viewMode === "table" ? (
          <JobsTable
            jobs={jobs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={setSelectedJob}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
        )}
      </section>

      {meta.total > PAGE_SIZE && (
        <nav
          className="flex items-center justify-between border-t border-border/60 pt-3"
          aria-label="Pagination"
        >
          <p className="text-[11px] text-muted-foreground">
            Page {meta.page} of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </nav>
      )}

      <JobDetailsDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Jobs;