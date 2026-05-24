import { useRef, useState } from "react";
import { Upload, Loader2, FileUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { aiService } from "@/services/aiService";
import { toast } from "@/hooks/use-toast";
import type { ResumeData } from "@/types/resume-builder";

interface Props {
  onParsed: (resume: Partial<ResumeData>, meta: { confidence: number; warnings: string[]; fileName: string }) => void;
}

/**
 * Extracts text from PDF / DOCX / TXT entirely on the client, then sends
 * the text to /api/ai/parse for structured extraction.
 *
 * Loads pdfjs-dist and mammoth lazily via dynamic import so the main bundle
 * stays small. If those packages are not installed in this project yet,
 * the dynamic import will fail and we fall back to a clear error toast.
 */
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
        text = await extractPdf(file);
      } else if (name.endsWith(".docx")) {
        setProgress("Extracting DOCX text…");
        text = await extractDocx(file);
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
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
          <FileUp className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Import an existing resume</p>
          <p className="text-xs text-gray-500">PDF, DOCX or TXT. Fields will autofill below.</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-gray-900"
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
      <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        Files are processed locally; only the extracted text is sent to AI.
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
        <AlertTriangle className="h-3 w-3" />
        For PDF/DOCX support install <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">pdfjs-dist</code> and{" "}
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">mammoth</code>.
      </p>
    </div>
  );
}

/* ---------------- file readers (dynamic imports) ---------------- */

async function extractPdf(file: File): Promise<string> {
  // dynamic import keeps pdfjs out of the main bundle
  const pdfjs: typeof import("pdfjs-dist") = await import("pdfjs-dist").catch(() => {
    throw new Error("pdfjs-dist is not installed. Run: pnpm add pdfjs-dist");
  });
  // worker
  try {
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    /* fall back to default worker */
  }
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
  }
  return text;
}

async function extractDocx(file: File): Promise<string> {
  const mammoth: typeof import("mammoth") = await import("mammoth").catch(() => {
    throw new Error("mammoth is not installed. Run: pnpm add mammoth");
  });
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value;
}
