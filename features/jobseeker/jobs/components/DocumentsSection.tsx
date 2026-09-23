import { FileText, Paperclip, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Job } from "@/types/job";
import FileUpload from "./FileUpload";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
}

type DocumentField = "resumeFile" | "coverLetterFile";

const DocumentsSection = ({ formData, setFormData }: Props) => {
  const renderField = (label: string, field: DocumentField) => {
    const current = formData[field];

    if (typeof current === "string" && current) {
      return (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5">
          <a
            href={current}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </a>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, [field]: null }))}
            aria-label={`Remove ${label}`}
            className="rounded p-0.5 text-muted-foreground transition hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <FileUpload
        label={label}
        accept=".pdf,.doc,.docx"
        value={current as File | null}
        onChange={(file) => setFormData((prev) => ({ ...prev, [field]: file }))}
      />
    );
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
        <Paperclip className="h-3 w-3 text-primary" />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Documents
        </span>
      </div>
      <div className="space-y-2 p-3">
        {renderField("Resume / CV", "resumeFile")}
        {renderField("Cover Letter", "coverLetterFile")}
      </div>
    </div>
  );
};

export default DocumentsSection;