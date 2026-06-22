import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/JobContext";
import { useJobsList } from "@/hooks/useJobsList";
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
  const navigate = useNavigate();
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
    const f: JobFilters = {
      page,
      limit: PAGE_SIZE,
      sort,
    };
    if (debouncedSearch.trim()) f.q = debouncedSearch.trim();
    if (statusFilter) f.status = [statusFilter];
    if (priorityFilter) f.priority = [priorityFilter as "low" | "medium" | "high" | "urgent"];
    return f;
  }, [debouncedSearch, statusFilter, priorityFilter, sort, page]);

  const { jobs, meta, isLoading, isFetching, refetch } = useJobsList(filters);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleEdit = (id: string) => navigate(`/applications/edit/${id}`);
  const handleDelete = async (id: string) => {
    await deleteJob(id);
    if (selectedJob?.id === id) setSelectedJob(null);
    refetch();
  };
  const handleAdd = () => navigate("/applications/add");

  const hasFilters = !!searchTerm || !!statusFilter || !!priorityFilter;
  const showSkeleton = isLoading && jobs.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 transition-colors">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track applications, interviews and deadlines in one place.
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2 self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" />
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

        <section aria-live="polite" className={cn(isFetching && !showSkeleton && "opacity-70 transition-opacity")}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <nav className="flex items-center justify-between border-t border-border/60 pt-4" aria-label="Pagination">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
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
    </div>
  );
};

export default Jobs;
