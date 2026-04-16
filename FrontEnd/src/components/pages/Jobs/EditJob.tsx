import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { Job } from "@/types";
import { useJobs } from "@/hooks/useJobs";
import { useUpdateJob } from "@/hooks/useUpdateJob";

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
  notes: "",
  interviews: [],
  resumeFile: null,
};

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading } = useJobs();
  const updateJob = useUpdateJob();

  const jobToEdit = useMemo(
    () => jobs.find((j) => j.id === id),
    [jobs, id]
  );

  const [formData, setFormData] = useState<Job>(emptyJob);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [expandedSections, setExpandedSections] = useState({
    jobInfo: true,
    dates: false,
    contactInfo: false,
    notes: false,
  });

  useEffect(() => {
    if (!id) {
      navigate("/jobs");
      return;
    }

    if (isLoading) return;

    if (!jobToEdit) {
      navigate("/jobs");
      return;
    }

    setFormData({
      ...emptyJob,
      ...jobToEdit,
    });
  }, [id, jobToEdit, isLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const required = ["title", "company", "location", "jobType", "status"];
    const newErrors: Record<string, string> = {};

    required.forEach((field) => {
      const value = formData[field as keyof Job];
      if (!value || String(value).trim() === "") {
        newErrors[field] = `${field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !validateForm()) return;

    try {
      await updateJob.mutateAsync({
        id,
        data: formData,
      });

      navigate("/jobs");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center mb-4">
          <Button variant="outline" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* JOB INFO */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("jobInfo")}
            >
              <h2 className="flex items-center font-semibold">
                <Briefcase className="w-4 h-4 mr-2" />
                Job Info
              </h2>
              {expandedSections.jobInfo ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.jobInfo && (
              <div className="grid gap-4 mt-4">

                {["title", "company", "location", "salaryRange"].map((field) => (
                  <div key={field}>
                    <Label>{field}</Label>
                    <Input
                      name={field}
                      value={String(formData[field as keyof Job] ?? "")}
                      onChange={handleChange}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm">{errors[field]}</p>
                    )}
                  </div>
                ))}

                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    value={formData.status ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

              </div>
            )}
          </div>

          {/* DATES */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("dates")}
            >
              <h2 className="flex items-center font-semibold">
                <Calendar className="w-4 h-4 mr-2" />
                Dates
              </h2>
              {expandedSections.dates ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.dates && (
              <div className="grid gap-4 mt-4">
                <Input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate ?? ""}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline ?? ""}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* CONTACT */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("contactInfo")}
            >
              <h2 className="flex items-center font-semibold">
                <User className="w-4 h-4 mr-2" />
                Contact
              </h2>
              {expandedSections.contactInfo ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.contactInfo && (
              <div className="grid gap-4 mt-4">
                <Input name="contactPerson" value={formData.contactPerson ?? ""} onChange={handleChange} />
                <Input name="contactEmail" value={formData.contactEmail ?? ""} onChange={handleChange} />
                <Input name="contactPhone" value={formData.contactPhone ?? ""} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* NOTES */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("notes")}
            >
              <h2 className="font-semibold">Notes</h2>
              {expandedSections.notes ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.notes && (
              <textarea
                name="notes"
                value={formData.notes ?? ""}
                onChange={handleChange}
                className="w-full border rounded p-2 mt-4"
                rows={4}
              />
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <Button type="submit" disabled={updateJob.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateJob.isPending ? "Saving..." : "Save"}
            </Button>

            <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditJob;