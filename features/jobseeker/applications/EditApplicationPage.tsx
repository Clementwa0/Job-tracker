"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";

import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview";

import { useUpdateJob } from "@/features/jobseeker/jobs/hooks";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { interviewService } from "@/features/jobseeker/interviews/services/interview.client";
import { getApiErrorMessage } from "@/lib/apiError";

import ContactSection from "@/features/jobseeker/jobs/components/ContactSection";
import JobDetailsSection from "@/features/jobseeker/jobs/components/JobDetailsSection";
import NotesSection from "@/features/jobseeker/jobs/components/NotesSection";
import InterviewSection from "@/features/jobseeker/interviews/components/InterviewSection";

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
  companyLogo: "",
  workMode: "",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "",
  priority: "low",
  tags: [],
  coverLetterFile: null,
  attachments: [],
  recruiterLinkedIn: "",
  jobDescription: "",
  matchScore: null,
  matchAnalysis: null,
  activity: [],
  reminders: [],
  isArchived: false,
};

type JobStringFields = Extract<
  keyof Job,
  "jobTitle" | "companyName" | "location" | "jobType" | "applicationStatus"
>;

const EditJob = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const { updateJob } = useUpdateJob();

  const [formData, setFormData] = useState<Job>(emptyJob);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const job = await jobService.getJobById(id);
        if (cancelled) return;
        setFormData({ ...job, interviews: job.interviews || [] });
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        toast.error(getApiErrorMessage(err) || "Job not found");
        router.push("/jobseeker/applications");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchJob();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

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
      if (!value || !value.trim()) newErrors[field] = "Required field";
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
      const { job: updated, error: updateErrorMessage } = await updateJob(id, jobData);
      if (!updated) {
        toast.error(updateErrorMessage || "Update failed");
        return;
      }

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

      await Promise.all([...interviewOps]);

      toast.success("Job updated", {
        description: `${jobData.jobTitle} at ${jobData.companyName}`,
      });
      router.push("/jobseeker/applications");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err) || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">
                Edit Job
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage application and interviews
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} size="sm" className="h-8 text-xs">
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <JobDetailsSection formData={formData} setFormData={setFormData} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Interviews</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="h-8 text-xs"
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
                        interviews: [...prev.interviews, newInterview],
                      }));
                    }

                    setIsInterviewModalOpen(false);
                    toast.success("Interview added");
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <ContactSection formData={formData} setFormData={setFormData} />
            <NotesSection formData={formData} setFormData={setFormData} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
