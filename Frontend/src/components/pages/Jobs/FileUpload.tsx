import React, { useState, useId } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  helperText?: string;
  maxSizeMb?: number;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onChange,
  value,
  helperText = "PDF, DOC, DOCX up to 5MB",
  maxSizeMb = 5,
}) => {
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File) => {
    setError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMb}MB`);
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validate(file)) onChange(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validate(file)) onChange(file);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground mb-2"
      >
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate text-foreground">
                {value.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatSize(value.size)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            aria-label={`Remove ${value.name}`}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-7 text-center transition",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
          )}
        >
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-3 text-sm text-foreground">
            <span className="font-medium text-primary">Click to upload</span>{" "}
            <span className="text-muted-foreground">or drag and drop</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        </label>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
