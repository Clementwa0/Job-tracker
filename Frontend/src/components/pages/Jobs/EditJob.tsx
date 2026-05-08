import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { Job } from "@/types";

import { useJobs } from "@/hooks/useJobs";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { toast } from "sonner";

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

type EditableField = "title" | "company" | "location" | "salaryRange";

const fieldLabels: Record<EditableField, string> = {
  title: "Job Title",
  company: "Company",
  location: "Location",
  salaryRange: "Salary Range",
};

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="flex items-center font-semibold text-gray-800 dark:text-white">
          {icon}
          <span className="ml-2">{title}</span>
        </h2>

        {expanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 transition-all duration-300 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { data: jobs = [], isLoading } = useJobs();

  const updateJob = useUpdateJob();

  const jobToEdit = useMemo(
    () => jobs.find((job) => job.id === id),
    [jobs, id],
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      "title",
      "company",
      "location",
      "jobType",
      "status",
    ];

    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const value = formData[field as keyof Job];

      if (!value || String(value).trim() === "") {
        newErrors[field] = `${field} is required`;
        toast.error(
          `${fieldLabels[field as EditableField] || field} is required`,
        );
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
      toast.success("Job updated successfully!");

      navigate("/jobs");
    } catch (error) {
      toast.error("Failed to update job. Please try again.");
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 dark:text-gray-400">Loading job...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* JOB INFO */}
          <SectionCard
            title="Job Information"
            icon={<Briefcase className="w-5 h-5" />}
            expanded={expandedSections.jobInfo}
            onToggle={() => toggleSection("jobInfo")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  "title",
                  "company",
                  "location",
                  "salaryRange",
                ] as EditableField[]
              ).map((field) => (
                <div key={field}>
                  <Label>{fieldLabels[field]}</Label>

                  <Input
                    className="mt-1"
                    name={field}
                    value={String(formData[field] ?? "")}
                    onChange={handleChange}
                  />

                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              {/* JOB TYPE */}
              <div>
                <Label>Job Type</Label>

                <select
                  name="jobType"
                  value={formData.jobType ?? ""}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 mt-1 bg-background"
                >
                  <option value="">Select job type</option>

                  <option value="full-time">Full Time</option>

                  <option value="part-time">Part Time</option>

                  <option value="contract">Contract</option>

                  <option value="internship">Internship</option>

                  <option value="remote">Remote</option>
                </select>

                {errors.jobType && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>
                )}
              </div>

              {/* STATUS */}
              <div>
                <Label>Status</Label>

                <select
                  name="status"
                  value={formData.status ?? ""}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 mt-1 bg-background"
                >
                  <option value="">Select status</option>

                  <option value="applied">Applied</option>

                  <option value="interviewing">Interviewing</option>

                  <option value="offer">Offer</option>

                  <option value="rejected">Rejected</option>
                </select>

                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* DATES */}
          <SectionCard
            title="Dates"
            icon={<Calendar className="w-5 h-5" />}
            expanded={expandedSections.dates}
            onToggle={() => toggleSection("dates")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Application Date</Label>

                <Input
                  className="mt-1"
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Application Deadline</Label>

                <Input
                  className="mt-1"
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </SectionCard>

          {/* CONTACT */}
          <SectionCard
            title="Contact Information"
            icon={<User className="w-5 h-5" />}
            expanded={expandedSections.contactInfo}
            onToggle={() => toggleSection("contactInfo")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Contact Person</Label>

                <Input
                  className="mt-1"
                  name="contactPerson"
                  value={formData.contactPerson ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Contact Email</Label>

                <Input
                  className="mt-1"
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Contact Phone</Label>

                <Input
                  className="mt-1"
                  name="contactPhone"
                  value={formData.contactPhone ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </SectionCard>

          {/* NOTES */}
          <SectionCard
            title="Notes"
            icon={<Briefcase className="w-5 h-5" />}
            expanded={expandedSections.notes}
            onToggle={() => toggleSection("notes")}
          >
            <div>
              <Label>Additional Notes</Label>

              <textarea
                name="notes"
                value={formData.notes ?? ""}
                onChange={handleChange}
                rows={5}
                className="w-full border rounded-md p-3 mt-1 bg-background"
              />
            </div>
          </SectionCard>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={updateJob.isPending}
              className="hover:bg-sky-700 hover:text-white transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />

              {updateJob.isPending ? "Saving..." : "Save Changes"}
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
    </div>
  );
};

export default EditJob;
