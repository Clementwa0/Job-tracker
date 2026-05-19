import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";

import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview";

import { useJobs } from "@/hooks/jobs";
import { interviewService } from "@/services/interviewService";

import {
  ContactSection,
  JobDetailsSection,
  NotesSection,
  InterviewSection,
} from "@/components";

import { Button } from "@/components/ui/button";

const emptyJob: Job = {
  id: "",
  jobTitle: "",
  companyName: "",
  location: "",
  salaryRange: "",
  jobType: "",
  applicationStatus: "",
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

type JobStringFields = Extract<
  keyof Job,
  "jobTitle" | "companyName" | "location" | "jobType" | "applicationStatus"
>;

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getJob, updateJob } = useJobs();

  const [formData, setFormData] = useState<Job>(emptyJob);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);


  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        return;
      }

      try {
        const job = getJob(id);

        if (!job) {
          toast.error("Job not found");
          navigate("/jobs");
          return;
        }

        setFormData({
          ...job,
          interviews: job.interviews || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, getJob, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredFields: JobStringFields[] = [
      "jobTitle",
      "companyName",
      "location",
      "jobType",
      "applicationStatus",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || !value.trim()) {
        newErrors[field] = "Required field";
      }
    });


    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !validateForm()) return;

    try {
      setIsSaving(true);

      const { interviews, ...jobData } = formData;

      await updateJob(id, jobData);


      const interviewOps = interviews.map((interview) => {
        if (!interview._id || interview._id.startsWith("temp-")) {
          return interviewService.createInterview({
            jobId: id,
            stage: interview.stage,
            status: interview.status,
            interviewDate: interview.interviewDate,
            location: interview.location,
            notes: interview.notes,
          });
        }

        return interviewService.updateInterview(interview._id, {
          stage: interview.stage,
          status: interview.status,
          interviewDate: interview.interviewDate,
          location: interview.location,
          notes: interview.notes,
        });
      });

      await Promise.all([ ...interviewOps]);

      navigate("/jobs");
    } catch (err: any) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-2xl font-bold">
                Edit Job
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage application and interviews
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <JobDetailsSection
              formData={formData}
              setFormData={setFormData}
            />

            {/* Interviews */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">
                  Interviews
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInterviewModalOpen(true)}
                >
                  Add Interview
                </Button>
              </div>

              {isInterviewModalOpen && (
                <InterviewSection
                  isOpen={isInterviewModalOpen}
                  onClose={() => setIsInterviewModalOpen(false)}
                  onSuccess={(newInterview?: Interview) => {
                    if (newInterview) {
                      setFormData((prev) => ({
                        ...prev,
                        interviews: [
                          ...prev.interviews,
                          newInterview,
                        ],
                      }));
                    }

                    setIsInterviewModalOpen(false);
                    toast.success("Interview added");
                  }}
                />
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <ContactSection
              formData={formData}
              setFormData={setFormData}
            />

            <NotesSection
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditJob;