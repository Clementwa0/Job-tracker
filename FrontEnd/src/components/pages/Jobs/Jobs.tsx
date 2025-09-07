import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobsTable from "./JobsTable";
import JobsFilter from "@/components/pages/Jobs/JobsFilter";
import JobCard from "@/components/pages/Jobs/JobCard";
import { useJobs } from "@/hooks/JobContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import JobModal from "./JobModel";
import type { Job } from "./job";

const Jobs: React.FC = () => {
  const { jobs, deleteJob } = useJobs();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">(isMobile ? "grid" : "table");
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
  const handleDelete = (id: string) => deleteJob(id);

  return (
    <div className="space-y-6 animate-fade-in bg-white dark:bg-gray-900 min-h-screen px-4 py-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Jobs</h1>
          <p className="text-muted-foreground mt-1 dark:text-gray-400">
            Manage your job applications and track their status
          </p>
        </div>
        <Button onClick={() => navigate("/add-job")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      {/* Filters */}
      <JobsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* View Switch */}
      <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "table" | "grid")}>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          <TabsList className="bg-muted dark:bg-gray-800 border dark:border-gray-700">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </div>

        {/* Table View */}
        <TabsContent value="table" className="mt-6">
          {filteredJobs.length > 0 ? (
            <JobsTable
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={(job) => setSelectedJob(job)}
            />
          ) : (
            <div className="text-center py-10 bg-card dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700">
              <p className="text-muted-foreground dark:text-gray-400">No jobs found matching your filters.</p>
            </div>
          )}
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-6 dark:bg-gray-900">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 dark:bg-gray-900">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  applicationDate={job.applicationDate}
                  applicationDeadline={job.applicationDeadline}
                  status={job.status}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={() => setSelectedJob(job)}
                  location={job.location}
                  jobType={job.jobType}
                  salaryRange={job.salaryRange}
                  resumeFile={job.resumeFile}
                  coverLetterFile={job.coverLetterFile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700">
              <p className="text-muted-foreground dark:text-gray-400">No jobs found matching your filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Detail Modal */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default Jobs;
