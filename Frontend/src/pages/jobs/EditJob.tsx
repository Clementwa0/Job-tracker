import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import JobInformationSection from "@/components/jobs/editJob/JobInformationSection";
import DatesSection from "@/components/jobs/editJob/DatesSection";
import ContactSection from "@/components/jobs/editJob/ContactSection";
import NotesSection from "@/components/jobs/editJob/NotesSection";

import { useJobs } from "@/hooks/useJobs";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { mapJob } from "@/lib/mappers";

import type { BackendJob, Job } from "@/types";

function toUpdatePayload(job: Job) {
  return {
    jobTitle: job.title,
    companyName: job.company,
    location: job.location,
    jobType: job.jobType,
    salaryRange: job.salaryRange,
    applicationDate: job.applicationDate,
    applicationDeadline: job.applicationDeadline,
    applicationStatus: job.status,
    notes: String(job.notes ?? ""),
    contactPerson: String(job.contactPerson ?? ""),
    contactEmail: String(job.contactEmail ?? ""),
    contactPhone: String(job.contactPhone ?? ""),
  };
}

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobs = [], isLoading } = useJobs();
  const updateMutation = useUpdateJob();

  const mappedJob = useMemo(() => {
    if (!jobs || !id) return null;
    const raw = (jobs as BackendJob[]).find((j) => j._id === id);
    return raw ? mapJob(raw) : null;
  }, [jobs, id]);

  const [formData, setFormData] = useState<Job | null>(null);

  useEffect(() => {
    if (!mappedJob) return;
    setFormData({
      ...mappedJob,
      notes: String(mappedJob.notes ?? ""),
      contactPerson: String(mappedJob.contactPerson ?? ""),
      contactEmail: String(mappedJob.contactEmail ?? ""),
      contactPhone: String(mappedJob.contactPhone ?? ""),
    });
  }, [mappedJob]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev ? { ...prev, [name]: value } : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    await updateMutation.mutateAsync({
      id,
      data: toUpdatePayload(formData),
    });
    navigate("/jobs");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!mappedJob || !formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Job not found.</p>
        <Button variant="link" className="mt-2 px-0" onClick={() => navigate("/jobs")}>
          Back to jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit application</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <JobInformationSection
          formData={formData}
          handleChange={handleChange}
        />
        <DatesSection formData={formData} handleChange={handleChange} />
        <ContactSection formData={formData} handleChange={handleChange} />
        <NotesSection formData={formData} handleChange={handleChange} />

        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/jobs")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
