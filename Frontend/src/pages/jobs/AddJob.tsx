import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Added Router hook import
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

import { useCreateJob } from "@/hooks/jobs";
import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview"; // Imported Interview type
import {
  ContactSection,
  JobDescriptionAnalyzer,
  JobDetailsSection,
  NotesSection,
} from "@/components";
import { Button } from "@/components/ui/button";

const AddJob = () => {
  const navigate = useNavigate(); // 2. Initialized navigation instance
  const { createJob, isLoading: isCreating } = useCreateJob();

  const [formData, setFormData] = useState<Job>({
    id: "",
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    applicationDate: "",
    applicationDeadline: "",
    applicationStatus: "applied",
    source: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    jobPostingUrl: "",
    notes: "",
    interviews: [] as Interview[], // 👈 Explicit type assertion fixes 'never[]' warning
    resumeFile: null,
    salaryRange: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.companyName) {
      toast.error("Missing required fields", {
        description: "Job Title and Company Name are required",
      });
      return;
    }

    const { id: _id, interviews: _interviews, ...payload } = formData;
    const created = await createJob(payload);

    if (created) {
      toast.success("Job added successfully", {
        description: `${formData.jobTitle} at ${formData.companyName}`,
      });
      
      // 3. Navigate away immediately after triggering toast success alert
      navigate("/jobs"); 
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page Heading & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Add New Job
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track details, analyze job postings, and organize contact networks.
              </p>
            </div>
          </div>

          {/* Form Layout Content Grid */}
          <JobDescriptionAnalyzer
            formData={formData}
            setFormData={setFormData}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Primary Columns: Job Meta & Parser (Takes up 2/3 of space) */}
            <div className="lg:col-span-2 space-y-6">
              <JobDetailsSection
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            {/* Sidebar Column: Networking Data & Scratchpad (Takes up 1/3 of space) */}
            <div className="space-y-6">
              <ContactSection formData={formData} setFormData={setFormData} />
            </div>
          </div>
          
          <NotesSection formData={formData} setFormData={setFormData} />
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto shadow-sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Save Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;