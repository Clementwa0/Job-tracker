import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/JobContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import type { Job } from "@/types/job";

import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import JobCard from "./JobCard";
import JobsEmptyState from "./JobsEmptyState";
import { JobsGridSkeleton, JobsTableSkeleton } from "./JobsSkeleton";
import JobDetailsDrawer from "./JobDetailsDrawer";

const Jobs: React.FC = () => {
  const { jobs, isLoading, deleteJob } = useJobs();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 200);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  const filteredJobs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return jobs.filter((job) => {
      const title = (job.jobTitle || "").toLowerCase();
      const company = (job.companyName || "").toLowerCase();
      const location = (job.location || "").toLowerCase();

      const matchSearch =
        !q ||
        title.includes(q) ||
        company.includes(q) ||
        location.includes(q);

      const matchStatus = statusFilter
        ? job.applicationStatus === statusFilter
        : true;

      return matchSearch && matchStatus;
    });
  }, [jobs, debouncedSearch, statusFilter]);

  const handleEdit = (id: string) => navigate(`/edit-job/${id}`);
  const handleDelete = (id: string) => {
    deleteJob(id);
    if (selectedJob?.id === id) setSelectedJob(null);
  };
  const handleAdd = () => navigate("/add-job");

  const hasFilters = !!searchTerm || !!statusFilter;
  const showSkeleton = isLoading && jobs.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 transition-colors">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Jobs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track applications, interviews and deadlines in one place.
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2 self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" />
            Add job
          </Button>
        </header>

        {/* Filters */}
        {(showSkeleton || jobs.length > 0) && (
          <JobsFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={jobs.length}
            filteredCount={filteredJobs.length}
          />
        )}

        {/* Content */}
        <section aria-live="polite">
          {showSkeleton ? (
            viewMode === "table" ? (
              <JobsTableSkeleton />
            ) : (
              <JobsGridSkeleton />
            )
          ) : filteredJobs.length === 0 ? (
            <JobsEmptyState
              hasFilters={hasFilters}
              onAdd={handleAdd}
              onClearFilters={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            />
          ) : viewMode === "table" ? (
            <JobsTable
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={setSelectedJob}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredJobs.map((job) => (
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
