"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, FileUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { aiService } from "@/features/jobseeker/resumes/services/ai.client";
import { extractDocumentText } from "@/lib/document/documentExtract";
import { toast } from "@/hooks/use-toast";
import type { ResumeData } from "@/types/resume-builder";

interface Props {
  onParsed: (resume: Partial<ResumeData>, meta: { confidence: number; warnings: string[]; fileName: string }) => void;
}

export default function ResumeImportPanel({ onParsed }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleFiles = async (file: File) => {
    setLoading(true);
    setProgress("Reading file…");
    try {
      let text = "";
      const name = file.name.toLowerCase();
      if (name.endsWith(".txt")) {
        text = await file.text();
      } else if (name.endsWith(".pdf")) {
        setProgress("Extracting PDF text…");
        text = await extractDocumentText(file);
      } else if (name.endsWith(".docx")) {
        setProgress("Extracting DOCX text…");
        text = await extractDocumentText(file);
      } else {
        throw new Error("Unsupported file type. Use PDF, DOCX or TXT.");
      }

      if (!text || text.trim().length < 80) {
        throw new Error("Could not extract enough text from the file.");
      }

      setProgress("Parsing with AI…");
      const result = await aiService.parseResume(text);
      onParsed(result.resume, {
        confidence: result.confidence,
        warnings: result.warnings || [],
        fileName: file.name,
      });
      toast({
        title: "Resume imported",
        description: `Confidence ${Math.round(result.confidence * 100)}% · ${file.name}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Import failed.";
      toast({ title: "Import failed", description: msg });
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          <FileUp className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Import an existing resume</p>
          <p className="text-xs text-muted-foreground">PDF, DOCX or TXT. Fields will autofill below.</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {loading ? progress || "Working…" : "Choose file"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFiles(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        Files are processed locally; only the extracted text is sent to AI.
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
        <AlertTriangle className="h-3 w-3" />
        For PDF/DOCX support install <code className="rounded bg-muted px-1 bg-card">pdfjs-dist</code> and{" "}
        <code className="rounded bg-muted px-1 bg-card">mammoth</code>.
      </p>
    </div>
  );
}
