import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type Dispatch, type SetStateAction } from "react";
import { analyzeJobService } from "@/services/analyzeJobService";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "sonner";
import type { Job } from "@/types/job";


interface Props {
  formData: Job;
  setFormData: Dispatch<SetStateAction<Job>>;
}

const JobDescriptionAnalyzer = ({ setFormData }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const extracted = await analyzeJobService.analyze({ description: text });

      setFormData((prev) => ({ ...prev, ...extracted }));

      toast.success("Auto-filled from job description");
    } catch (err) {
      toast.error("Analysis failed", {
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <h2 className="font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Job Description Analyzer
      </h2>

      <textarea
        className="w-full border rounded-md p-2 min-h-[120px]"
        placeholder="Paste job description here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button onClick={analyze} disabled={loading || !text.trim()}>
        {loading ? "Analyzing..." : "Auto Fill"}
      </Button>
    </div>
  );
};

export default JobDescriptionAnalyzer;