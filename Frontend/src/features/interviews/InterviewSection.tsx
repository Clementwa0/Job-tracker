import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { interviewService } from "@/services/interviewService";
import type { CreateInterviewRequest } from "@/types/interview";

import { useJobs } from "@/hooks/jobs";
import { toast } from "sonner";

import {
  Calendar,
  MapPin,
  Award,
  Layers,
  Clipboard,
  Loader2,
} from "lucide-react";
import { interviewStages, interviewStatus } from "@/constants";

interface AddInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (interview?: any) => void;
}

const initialFormState: CreateInterviewRequest = {
  jobId: "",
  stage: "hr",
  status: "scheduled",
  interviewDate: "",
  location: "online",
  notes: "",
};

const InterviewSection = ({
  isOpen,
  onClose,
  onSuccess,
}: AddInterviewModalProps) => {
  const { jobs = [] } = useJobs();
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [formData, setFormData] =
    useState<CreateInterviewRequest>(initialFormState);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobId || !formData.interviewDate) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const createdInterview = await interviewService.createInterview(formData);

      onSuccess(createdInterview);

      handleClose();
    } catch (err: any) {
      console.error("Interview creation failed:", err);

      toast.error(
        err?.response?.data?.message || "Failed to schedule interview.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Schedule New Interview
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details below to schedule an interview.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Job Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-primary" />
              Select Application *
            </label>

            <select
              name="jobId"
              value={formData.jobId}
              onChange={handleChange}
              required
              className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Choose an active application --</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.companyName} — {job.jobTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Stage + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Interview Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
              >
                {interviewStages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {interviewStatus.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="interviewDate"
              value={formData.interviewDate}
              min={minDateTime}
              onChange={handleChange}
              required
              className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location / Meeting Link
            </label>

            <input
              type="text"
              name="location"
              placeholder="Google Meet / Office"
              value={formData.location}
              onChange={handleChange}
              className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Clipboard className="h-3.5 w-3.5 text-primary" />
              Notes
            </label>

            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full text-sm bg-background border border-border rounded-lg p-2 text-foreground resize-none focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}

              {isSubmitting ? "Scheduling..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSection;
