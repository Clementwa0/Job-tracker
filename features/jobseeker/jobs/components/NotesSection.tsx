import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Job } from "@/types/job";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
}

const NotesSection = ({ formData, setFormData }: Props) => {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-semibold">
        <FileText className="h-3.5 w-3.5 text-primary" />
        Notes
      </h2>

      <div className="space-y-1.5">
        <Label className="text-xs">Personal Notes</Label>
        <textarea
          className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-background p-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Write anything about this job..."
        />
      </div>
    </div>
  );
};

export default NotesSection;