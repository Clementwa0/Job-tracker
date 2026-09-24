"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

import { useCreateJob } from "@/features/jobseeker/jobs/hooks";
import JobDescriptionAnalyzer from "@/features/jobseeker/jobs/components/JobDescriptionAnalyzer";
import JobDetailsSection from "@/features/jobseeker/jobs/components/JobDetailsSection";
import ContactSection from "@/features/jobseeker/jobs/components/ContactSection";
import DocumentsSection from "@/features/jobseeker/jobs/components/DocumentsSection";
import NotesSection from "@/features/jobseeker/jobs/components/NotesSection";
import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview";
import { Button } from "@/components/ui/button";

const FORM_ID = "add-job-form";

const INITIAL_JOB: Job = {
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
  interviews: [] as Interview[],
  resumeFile: null,
  salaryRange: "",
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

const AddJob = () => {
  const router = useRouter();
  const { createJob, isLoading: isCreating } = useCreateJob();

  const [formData, setFormData] = useState<Job>(INITIAL_JOB);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isDirty = useMemo(
    () => submitted || JSON.stringify(formData) !== JSON.stringify(INITIAL_JOB),
    [formData, submitted],
  );

  const validate = useCallback((data: Job) => {
    const next: Record<string, string> = {};
    if (!data.jobTitle?.trim()) next.jobTitle = "Job title is required";
    if (!data.companyName?.trim())
      next.companyName = "Company name is required";
    if (
      data.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
    ) {
      next.contactEmail = "Enter a valid email address";
    }
    return next;
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setSubmitted(true);

      const nextErrors = validate(formData);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        toast.error("Please fix the highlighted fields");
        const firstKey = Object.keys(nextErrors)[0];
        document
          .querySelector(`[data-field="${firstKey}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const { id: _id, interviews: _interviews, ...payload } = formData;
      const { job: created, error: createErrorMessage } =
        await createJob(payload);

      if (created) {
        toast.success("Job added successfully", {
          description: `${formData.jobTitle} at ${formData.companyName}`,
        });
        router.push("/jobseeker/applications");
      } else {
        toast.error(
          createErrorMessage || "Failed to add job. Please try again.",
        );
      }
    },
    [formData, validate, createJob, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isCreating) handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit, isCreating]);

  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) {
      return;
    }
    router.back();
  }, [isDirty, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky command bar ─────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
              Add New Job
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Track details, analyze postings, organize contacts.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isDirty && (
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                Unsaved
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              size="sm"
              disabled={isCreating}
              title="⌘S"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-3.5 w-3.5" />
                  Save Job
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Form body ──────────────────────────────────── */}
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-6xl space-y-4 px-4 py-4 sm:px-6"
      >
        {/* ── Workspace · Two stacked rails ───────────────
            Left rail:  Analyzer → Details  (the big content)
            Right rail: Contact  → Documents (supporting info)
            Both rails fill the same vertical band so there's
            no dead space beside either column. */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {/* Left rail - 8 cols */}
          <div className="space-y-4 lg:col-span-8">
            <JobDescriptionAnalyzer
              formData={formData}
              setFormData={setFormData}
            />
            <div data-field="jobTitle">
              <JobDetailsSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </div>
            <NotesSection formData={formData} setFormData={setFormData} />
          </div>

          {/* Right rail - 4 cols, stacked */}
          <div className="space-y-4 lg:col-span-4">
            <div data-field="contactEmail">
              <ContactSection formData={formData} setFormData={setFormData} />
            </div>
            <DocumentsSection formData={formData} setFormData={setFormData} />
          </div>
        </div>

        {/* Mobile-only bottom save */}
        <div className="flex justify-end pt-1 lg:hidden">
          <Button
            type="submit"
            disabled={isCreating}
            size="sm"
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Save Job
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddJob;
