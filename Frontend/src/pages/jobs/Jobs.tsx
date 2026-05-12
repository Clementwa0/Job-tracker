import React, { useState, useMemo } from "react";
import type { Job } from "@/types";
import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { JobsPageSkeleton } from "@/pages/shared/skeletons";

import { useJobs } from "@/hooks/useJobs";
import { useDeleteJob } from "@/hooks/useDeleteJob";
import { mapJob } from "@/lib/mappers";
import { useIsMobile } from "@/hooks/use-mobile";

import { JobCard, JobModal, JobFilters, JobsTable } from "@/components";

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

  /* -----------------------------
     Filter + Search
  ------------------------------ */
  const filteredJobs = useMemo(() => {
    return jobs
      .map(mapJob)
      .filter((job) => {
        const matchSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter
          ? job.status === statusFilter
          : true;

        return matchSearch && matchStatus;
      });
  }, [jobs, searchTerm, statusFilter]);

  /* -----------------------------
     Actions
  ------------------------------ */
  const handleEdit = (id: string) => navigate(`/edit-job/${id}`);

  const handleDelete = (id: string) => {
    deleteJobMutation.mutate(id);
  };

  /* -----------------------------
     Export Excel
  ------------------------------ */
  const handleExportToExcel = () => {
    const exportData = filteredJobs.map((job) => ({
      Title: job.title,
      Company: job.company,
      Status: job.status,
      Location: job.location,
      JobType: job.jobType,
      SalaryRange: job.salaryRange,
      ApplicationDate: job.applicationDate
        ? new Date(job.applicationDate).toLocaleDateString()
        : "",
      ApplicationDeadline: job.applicationDeadline
        ? new Date(job.applicationDeadline).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "jobs_export.xlsx");
  };

  /* -----------------------------
     Loading
  ------------------------------ */
  if (isLoading) {
    return (
      <JobsPageSkeleton
        variant={isMobile ? "grid" : "table"}
        count={8}
      />
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen px-4 py-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage and track your applications
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => navigate("/add-job")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <JobFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* VIEW TOGGLE */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "table" | "grid")}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} jobs
          </p>

          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </div>

        {/* TABLE VIEW */}
        <TabsContent value="table">
          {filteredJobs.length ? (
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

        {/* GRID VIEW */}
        <TabsContent value="grid">
          {filteredJobs.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* MODAL */}
      <JobModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};

export default Jobs;

/* -----------------------------
   EMPTY STATE
------------------------------ */
const EmptyState = () => (
  <div className="text-center py-10 border rounded-lg">
    <p className="text-muted-foreground">
      No jobs found matching your filters
    </p>
  </div>
);