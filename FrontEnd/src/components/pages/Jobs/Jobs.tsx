import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobsTable from "./JobsTable";
import JobsFilter from "@/components/pages/Jobs/JobsFilter";
import JobCard from "@/components/pages/Jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { useDeleteJob } from "@/hooks/useDeleteJob";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import JobModal from "./JobModel";
import { JobsPageSkeleton } from "@/components/shared/skeletons";
import type { Job } from "@/types";
import * as XLSX from "xlsx";

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: jobs = [], isLoading } = useJobs();
  const deleteJobMutation = useDeleteJob();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">(
    isMobile ? "grid" : "table"
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter ? job.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const handleEdit = (id: string) => navigate(`/edit-job/${id}`);

  const handleDelete = (id: string) => {
    deleteJobMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <JobsPageSkeleton variant={isMobile ? "grid" : "table"} count={8} />
    );
  }

  const handleExportToExcel = () => {
    const exportData = filteredJobs.map((job) => ({
      Title: job.title,
      Company: job.company,
      Status: job.status,
      Location: job.location,
      JobType: job.jobType,
      SalaryRange: job.salaryRange,
      ApplicationDate: new Date(job.applicationDate).toLocaleDateString(),
      ApplicationDeadline: new Date(job.applicationDeadline).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

    XLSX.writeFile(workbook, "jobs_export.xlsx");
  };

  return (
    <div className="space-y-6 animate-fade-in bg-white dark:bg-gray-900 min-h-screen px-4 py-6 transition-colors">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job applications and track their status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportToExcel} variant="outline">
            Export to Excel
          </Button>

          <Button onClick={() => navigate("/add-job")} variant="secondary">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <JobsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* View Switch */}
      <Tabs
        defaultValue={viewMode}
        onValueChange={(v) => setViewMode(v as "table" | "grid")}
      >
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>

          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </div>

        {/* TABLE */}
        <TabsContent value="table" className="mt-6">
          {filteredJobs.length > 0 ? (
            <JobsTable
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={(job) => setSelectedJob(job)}
            />
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        {/* GRID */}
        <TabsContent value="grid" className="mt-6">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={() => setSelectedJob(job)}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default Jobs;

/* ---------------- helper ---------------- */
const EmptyState = () => (
  <div className="text-center py-10 bg-card rounded-lg border">
    <p className="text-muted-foreground">
      No jobs found matching your filters.
    </p>
  </div>
);