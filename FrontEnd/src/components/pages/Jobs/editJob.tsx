import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useJobs } from "@/hooks/JobContext";
import type { Job } from "./JobsTable";

const EditJob: React.FC = () => {
  const { id } = useParams(); // from URL
  const navigate = useNavigate();
  const { jobs, updateJob } = useJobs();

  const [formData, setFormData] = useState<Job | null>(null);

  // Fetch the job to edit
  useEffect(() => {
    const jobToEdit = jobs.find((job) => job.id === id);
    if (jobToEdit) setFormData(jobToEdit);
  }, [id, jobs]);

  if (!formData) {
    return <p className="text-center mt-10 text-muted-foreground">Loading job data...</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev && { ...prev, [name]: value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData || !formData.id) return;

  try {
    await updateJob(formData.id, formData); // ✅ pass both id and updated job
    navigate("/jobs");
  } catch (error) {
    console.error("Failed to update job:", error);
  }
};

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input name="title" value={formData.title} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input name="company" value={formData.company} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="jobType">Job Type</Label>
          <Input name="jobType" value={formData.jobType} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="salaryRange">Salary Range</Label>
          <Input name="salaryRange" value={formData.salaryRange} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="applicationDate">Application Date</Label>
          <Input name="applicationDate" type="date" value={formData.applicationDate} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="applicationDeadline">Deadline</Label>
          <Input name="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            name="status"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default EditJob;
