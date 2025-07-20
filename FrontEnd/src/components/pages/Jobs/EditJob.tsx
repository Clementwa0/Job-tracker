import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useJobs } from "@/hooks/JobContext";
import type { Job } from "./JobsTable";

const emptyJob: Job = {
  id: "",
  title: "",
  company: "",
  location: "",
  salaryRange: "",
  jobType: "",
  status: "",
  applicationDate: "",
  applicationDeadline: "",
  contactEmail: "",
  contactPhone: "",
  jobPostingUrl: "",
  contactPerson: "",
  source: "",
  nextStepsDate: "",
  notes: "",
  interviews: [],
  coverLetterFile: null,
  resumeFile: null
};

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();

  const [formData, setFormData] = useState<Job>(emptyJob);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  const fetchJob = async () => {
    if (!id) {
      navigate("/jobs");
      return;
    }

    const jobToEdit = getJob(id);
    if (jobToEdit) {
      setFormData(jobToEdit);
    } else {
      navigate("/jobs");
    }
    setIsLoading(false);
  };

  fetchJob();
}, [id, getJob, navigate]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      "title", "company", "location", "applicationDate",
      "applicationDeadline", "jobType", "status",
      "contactEmail", "contactPhone", "jobPostingUrl",
      "nextStepsDate", "contactPerson", "source"
    ];
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      const value = formData[field as keyof Job];
      if (typeof value === "string" && value.trim() === "") {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !validateForm()) return;
    try {
      await updateJob(id, formData);
      navigate("/jobs");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Loading job...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white dark:bg-gray-900 shadow rounded-xl">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {["title", "company", "location", "salaryRange"].map((field) => (
            <div key={field}>
              <Label htmlFor={field}>{field.replace(/([A-Z])/g, " $1")} *</Label>
              <Input
                id={field}
                name={field}
                value={formData[field as keyof Job] ?? ""}
                onChange={handleChange}
                className={errors[field] ? "border-red-500" : ""}
              />
              {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <Label htmlFor="jobType">Job Type *</Label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select</option>
              {["Full-Time", "Part-Time", "Contract", "Internship"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.jobType && <p className="text-sm text-red-500">{errors.jobType}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              name="status"
              value={formData.status ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select</option>
              {["applied", "interviewing", "offer", "rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>

          <div>
            <Label htmlFor="applicationDate">Application Date *</Label>
            <Input
              id="applicationDate"
              name="applicationDate"
              type="date"
              value={formData.applicationDate ?? ""}
              onChange={handleChange}
              className={errors.applicationDate ? "border-red-500" : ""}
            />
            {errors.applicationDate && <p className="text-sm text-red-500">{errors.applicationDate}</p>}
          </div>

          <div>
            <Label htmlFor="applicationDeadline">Application Deadline *</Label>
            <Input
              id="applicationDeadline"
              name="applicationDeadline"
              type="date"
              value={formData.applicationDeadline ?? ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {["contactPerson", "contactEmail", "contactPhone", "jobPostingUrl", "source"].map((field) => (
          <div key={field}>
            <Label htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</Label>
            <Input
              id={field}
              name={field}
              value={formData[field as keyof Job] ?? ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <div>
          <Label htmlFor="nextStepsDate">Next Steps Date</Label>
          <Input
            id="nextStepsDate"
            name="nextStepsDate"
            type="date"
            value={formData.nextStepsDate ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            value={formData.notes ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" className="w-full">Save Changes</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/jobs")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
