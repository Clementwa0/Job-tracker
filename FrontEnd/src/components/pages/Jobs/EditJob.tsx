import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useJobs } from "@/hooks/JobContext";
import { ArrowLeft, Save, Calendar, Mail, Phone, Globe, User, FileText, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/jobs")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Edit Job Application</h1>
            <p className="text-indigo-100 mt-1">Update your job application details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Job Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Job Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { field: "title", label: "Job Title", icon: <FileText className="w-4 h-4" /> },
                  { field: "company", label: "Company", icon: <Briefcase className="w-4 h-4" /> },
                  { field: "location", label: "Location", icon: <MapPin className="w-4 h-4" /> },
                  { field: "salaryRange", label: "Salary Range", icon: <DollarSign className="w-4 h-4" /> }
                ].map(({ field, label, icon }) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label} *
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
                    {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
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
                      className={`w-full border rounded-lg px-3 py-2 pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.jobType ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select job type</option>
                      {["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {errors.jobType && <p className="text-sm text-red-500">{errors.jobType}</p>}
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
                    className={`w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.status ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select status</option>
                    <option value="interested" className="text-blue-600">Interested</option>
                    <option value="applied" className="text-yellow-600">Applied</option>
                    <option value="interviewing" className="text-purple-600">Interviewing</option>
                    <option value="offer" className="text-green-600">Offer</option>
                    <option value="rejected" className="text-red-600">Rejected</option>
                  </select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Important Dates
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { field: "applicationDate", label: "Application Date" },
                  { field: "applicationDeadline", label: "Application Deadline" },
                  { field: "nextStepsDate", label: "Next Steps Date" }
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label} {field !== "nextStepsDate" ? "*" : ""}
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
                    {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { field: "contactPerson", label: "Contact Person", icon: <User className="w-4 h-4" /> },
                  { field: "contactEmail", label: "Contact Email", icon: <Mail className="w-4 h-4" /> },
                  { field: "contactPhone", label: "Contact Phone", icon: <Phone className="w-4 h-4" /> },
                  { field: "jobPostingUrl", label: "Job Posting URL", icon: <Globe className="w-4 h-4" /> },
                  { field: "source", label: "Source", icon: <Globe className="w-4 h-4" /> }
                ].map(({ field, label, icon }) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label} {field !== "source" ? "*" : ""}
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
                    {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Additional Notes</h2>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.notes ?? ""}
                  onChange={handleChange}
                  placeholder="Add any additional notes about this job application..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all hover:shadow-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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