import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Interview, InterviewStage, InterviewStatus } from "@/types/interview";
import { interviewService } from "@/services/interviewService";
import { useJobs } from "@/hooks/jobs";
import type { Job } from "@/types/job";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: (i: Interview) => void;
  defaultJobId?: string;
}

type FormState = {
  jobId: string;
  stage: InterviewStage;
  status: InterviewStatus;
  interviewDate: string;
  location: string;
  notes: string;
};

const InterviewModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  const { jobs } = useJobs();

  const [form, setForm] = useState<FormState>({
    jobId: "",
    stage: "phone",
    status: "scheduled",
    interviewDate: "",
    location: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectJob = (job: Job) => {
    setForm((prev) => ({
      ...prev,
      jobId: job.id,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const created = await interviewService.createInterview({
        jobId: form.jobId,
        stage: form.stage,
        status: form.status,
        location: form.location,
        notes: form.notes,
        interviewDate: new Date(form.interviewDate).toISOString(),
      });

      onOpenChange(false);
      onSuccess?.(created);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Interview</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          {/* JOB SELECTOR */}
          <div className="border rounded-md max-h-40 overflow-y-auto">
            {jobs?.map((job: Job) => (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className={`p-2 cursor-pointer hover:bg-muted ${
                  form.jobId === job.id ? "bg-muted" : ""
                }`}
              >
                <p className="text-sm font-medium">{job.companyName}</p>
                <p className="text-xs text-muted-foreground">
                  {job.jobTitle}
                </p>
              </div>
            ))}
          </div>

          {/* FORM */}
          <Input
            name="stage"
            placeholder="Stage (phone/hr/technical)"
            value={form.stage}
            onChange={handleChange}
          />

          <Input
            name="status"
            placeholder="Status (scheduled/passed/failed)"
            value={form.status}
            onChange={handleChange}
          />

          <Input
            type="datetime-local"
            name="interviewDate"
            value={form.interviewDate}
            onChange={handleChange}
          />

          <Input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />

          <Input
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <Button
            onClick={handleSubmit}
            disabled={loading || !form.jobId}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Interview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewModal;