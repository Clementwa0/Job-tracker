import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

import type { Job } from "@/types/job";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
}

const NotesSection = ({ formData, setFormData }: Props) => {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <h2 className="font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Notes
      </h2>

      <div>
        <Label>Personal Notes</Label>
        <textarea
          className="w-full border rounded-md p-2 min-h-[120px]"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Write anything about this job..."
        />
      </div>
    </div>
  );
};

export default NotesSection;