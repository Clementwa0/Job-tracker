import { useRef, useState } from "react";
import { cvService } from "@/services/cvService";
import { UploadSection, ScoreOverview } from "@/components";
import { useFileParser } from "@/utils/useFileParser";
import type { CVFeedback } from "@/types/resume.types";

const cvReview = () => {
  const [cvText, setCvText] = useState("");
  const [feedback, setFeedback] = useState<CVFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { parseFile } = useFileParser();

  const handleFile = async (file?: File) => {
    if (!file) return;
    const text = await parseFile(file);
    setCvText(text);
  };

  const analyze = async () => {
    const feedback = await cvService.reviewCv({ cvText });
    setFeedback(feedback);
  };

  return (
    <div className="p-6 space-y-6">
      <UploadSection onFile={handleFile} fileInputRef={fileInputRef} />

      <textarea
        className="w-full border p-3"
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />

      <button onClick={analyze} className="bg-blue-600 text-white px-4 py-2">
        Analyze
      </button>

      {feedback && <ScoreOverview score={feedback.ats_score} />}
    </div>
  );
};

export default cvReview;