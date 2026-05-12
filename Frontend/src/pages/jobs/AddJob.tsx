import { useState } from "react";
import { useNavigate } from "react-router-dom";

import JobDetailsCard from "@/components/jobs/addJob/JobDetailsCard";
import DocumentsNotesCard from "@/components/jobs/addJob/DocumentsNotesCard";

import { useCreateJob } from "@/hooks/useCreateJob";

import type { Interview, JobApplication } from "@/types";

function emptyJob(): JobApplication {
  return {
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    applicationDate: "",
    applicationDeadline: "",
    source: "",
    applicationStatus: "applied",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    resumeFile: null,
    jobPostingUrl: "",
    salaryRange: "",
    notes: "",
    interviews: [],
  };
}

function toCreatePayload(form: JobApplication) {
  return {
    jobTitle: form.jobTitle,
    companyName: form.companyName,
    location: form.location,
    jobType: form.jobType,
    applicationDate: form.applicationDate || undefined,
    applicationDeadline: form.applicationDeadline || undefined,
    source: form.source,
    applicationStatus: form.applicationStatus,
    contactPerson: form.contactPerson,
    contactEmail: form.contactEmail,
    contactPhone: form.contactPhone,
    salaryRange: form.salaryRange,
    notes: form.notes,
    interviews: form.interviews,
    jobPostingUrl: form.jobPostingUrl,
  };
}

export default function AddJob() {
  const navigate = useNavigate();
  const createMutation = useCreateJob();
  const [formData, setFormData] = useState<JobApplication>(emptyJob);

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    field: "resumeFile",
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const addInterview = () => {
    setFormData((prev) => ({
      ...prev,
      interviews: [
        ...prev.interviews,
        { date: "", notes: "", type: "" },
      ],
    }));
  };

  const removeInterview = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interviews: prev.interviews.filter((_, i) => i !== index),
    }));
  };

  const updateInterview = (
    index: number,
    field: keyof Interview,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      interviews: prev.interviews.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(toCreatePayload(formData));
    navigate("/jobs");
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add application</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <JobDetailsCard
          formData={formData}
          handleInputChange={handleInputChange}
        />

        <DocumentsNotesCard
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          addInterview={addInterview}
          removeInterview={removeInterview}
          updateInterview={updateInterview}
          isSubmitting={createMutation.isPending}
        />
      </form>
    </div>
  );
}
