import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useJobs } from "@/hooks/JobContext";
import {
  ArrowLeft,
  Save,
  Calendar,
  Mail,
  Phone,
  Globe,
  User,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Job } from "@/types";

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

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();

  const [formData, setFormData] = useState<Job>(emptyJob);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    jobInfo: true,
    dates: false,
    contactInfo: false,
    interviews: false,
    notes: false,
  });

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ["title", "company", "location", "jobType", "status"];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const value = formData[field as keyof Job];
      if (typeof value === "string" && value.trim() === "") {
        newErrors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} is required`;
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100">
        <div className="text-center py-20 text-muted-foreground">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/jobs")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md py-2 px-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Job Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('jobInfo')}
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                  Job Information
                </h2>
                {expandedSections.jobInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              
              {expandedSections.jobInfo && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {[
                    {
                      field: "title",
                      label: "Job Title",
                      icon: <FileText className="w-4 h-4" />,
                      required: true,
                    },
                    {
                      field: "company",
                      label: "Company",
                      icon: <Briefcase className="w-4 h-4" />,
                      required: true,
                    },
                    {
                      field: "location",
                      label: "Location",
                      icon: <MapPin className="w-4 h-4" />,
                      required: true,
                    },
                    {
                      field: "salaryRange",
                      label: "Salary Range",
                      icon: <DollarSign className="w-4 h-4" />,
                      required: false,
                    },
                  ].map(({ field, label, icon, required }) => (
                    <div key={field} className="space-y-2">
                      <Label
                        htmlFor={field}
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {label} {required && "*"}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          {icon}
                        </div>
                        <Input
                          id={field}
                          name={field}
                          value={formData[field as keyof Job] ?? ""}
                          onChange={handleChange}
                          className={`pl-10 ${errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-sm text-red-500">{errors[field]}</p>
                      )}
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="jobType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Type *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Clock className="w-4 h-4" />
                      </div>
                      <select
                        id="jobType"
                        name="jobType"
                        value={formData.jobType ?? ""}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.jobType ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select job type</option>
                        {["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.jobType && (
                      <p className="text-sm text-red-500">{errors.jobType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status *
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status ?? ""}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.status ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select status</option>
                      <option value="interested">Interested</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dates Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('dates')}
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Important Dates
                </h2>
                {expandedSections.dates ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              
              {expandedSections.dates && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {[
                    {
                      field: "applicationDate",
                      label: "Application Date",
                      required: false,
                    },
                    {
                      field: "applicationDeadline",
                      label: "Application Deadline",
                      required: false,
                    },
                  ].map(({ field, label, required }) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label} {required && "*"}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <Input
                          id={field}
                          name={field}
                          type="date"
                          value={formData[field as keyof Job] ?? ""}
                          onChange={handleChange}
                          className={`pl-10 ${errors[field] ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-sm text-red-500">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('contactInfo')}
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Contact Information
                </h2>
                {expandedSections.contactInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              
              {expandedSections.contactInfo && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {[
                    {
                      field: "contactPerson",
                      label: "Contact Person",
                      icon: <User className="w-4 h-4" />,
                      required: false,
                    },
                    {
                      field: "contactEmail",
                      label: "Contact Email",
                      icon: <Mail className="w-4 h-4" />,
                      required: false,
                    },
                    {
                      field: "contactPhone",
                      label: "Contact Phone",
                      icon: <Phone className="w-4 h-4" />,
                      required: false,
                    },
                    {
                      field: "jobPostingUrl",
                      label: "Job Posting URL",
                      icon: <Globe className="w-4 h-4" />,
                      required: false,
                    },
                    {
                      field: "source",
                      label: "Source",
                      icon: <Globe className="w-4 h-4" />,
                      required: false,
                    },
                  ].map(({ field, label, icon, required }) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label} {required && "*"}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          {icon}
                        </div>
                        <Input
                          id={field}
                          name={field}
                          value={formData[field as keyof Job] ?? ""}
                          onChange={handleChange}
                          className={`pl-10 ${errors[field] ? "border-red-500" : "border-gray-300"}`}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          type={field === "contactEmail" ? "email" : "text"}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-sm text-red-500">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('notes')}
              >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Additional Notes
                </h2>
                {expandedSections.notes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              
              {expandedSections.notes && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.notes ?? ""}
                    onChange={handleChange}
                    placeholder="Add any additional notes about this job application..."
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                className="py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className="py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate("/jobs")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJob;