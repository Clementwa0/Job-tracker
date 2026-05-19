import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { interviewService } from "@/services/interviewService";
import type {
  Interview,
  InterviewStage,
  InterviewStatus,
} from "@/types/interview";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { interviewStages, interviewStatus } from "@/constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  onSuccess?: () => void;
}

const EditInterviewModal = ({
  open,
  onOpenChange,
  interview,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    stage: "" as InterviewStage,
    status: "" as InterviewStatus,
    interviewDate: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (interview) {
      setForm({
        stage: interview.stage,
        status: interview.status,
        interviewDate: interview.interviewDate.slice(0, 16),
        location: interview.location,
        notes: interview.notes || "",
      });
    }
  }, [interview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!interview) return;

    try {
      setLoading(true);

      await interviewService.updateInterview(interview._id, {
        ...form,
        interviewDate: new Date(form.interviewDate).toISOString(),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-sky-900">
        <DialogHeader>
          <DialogTitle>Edit Interview</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-slate-200">Stage</Label>

            <Select
              value={form.stage}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, stage: value as InterviewStage }))
              }
            >
              <SelectTrigger
                className="
        w-full
        bg-slate-950/40
        border border-slate-700
        text-slate-100
        rounded-xl
        px-3 py-5
        shadow-sm
        hover:border-sky-400/50
        focus:ring-2 focus:ring-sky-500/40
        focus:outline-none
        transition
      "
              >
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl">
                {interviewStages.map((stage) => (
                  <SelectItem
                    key={stage.value}
                    value={stage.value}
                    className="hover:bg-sky-500/10 focus:bg-sky-500/10"
                  >
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-slate-200">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  status: value as InterviewStatus,
                }))
              }
            >
              <SelectTrigger
                className="
        w-full
        bg-slate-950/40
        border border-slate-700
        text-slate-100
        rounded-xl
        px-3 py-5
        shadow-sm
        hover:border-emerald-400/50
        focus:ring-2 focus:ring-emerald-500/40
        focus:outline-none
        transition
      "
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl">
                {interviewStatus.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span
                      className={`
        px-2 py-1
        rounded-md
        text-xs
        font-medium
        border
        $ {status.color}
      `}
                    >
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="datetime-local"
              name="interviewDate"
              value={form.interviewDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Input name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInterviewModal;
