import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Loader2,
  FileUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { aiService } from "@/services/aiService";
import { toast } from "@/hooks/use-toast";
import type { ResumeData } from "@/types/resume-builder";

interface Props {
  onParsed: (
    resume: Partial<ResumeData>,
    meta: { confidence: number; warnings: string[]; fileName: string },
  ) => void;
}

type Stage = "idle" | "reading" | "extracting" | "parsing" | "done" | "error";

interface ProgressState {
  stage: Stage;
  message: string;
  percent: number;
}

const STAGE_PCT: Record<Stage, number> = {
  idle: 0,
  reading: 15,
  extracting: 45,
  parsing: 80,
  done: 100,
  error: 0,
};

const ACCEPT =
  ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

/**
 * Extracts text from PDF / DOCX / TXT entirely on the client, then sends only
 * the extracted text to /api/ai/parse for structured extraction.
 *
 * `pdfjs-dist` and `mammoth` are loaded via dynamic `import()` so they stay
 * out of the main bundle until the user actually drops a file.
 */
function ResumeImportPanel({ onParsed }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<ProgressState>({
    stage: "idle",
    message: "",
    percent: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  const busy = progress.stage !== "idle" && progress.stage !== "done" && progress.stage !== "error";

  const updateStage = useCallback((stage: Stage, message: string) => {
    setProgress({ stage, message, percent: STAGE_PCT[stage] });
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      updateStage("reading", "Reading file…");
      try {
        let text = "";
        const name = file.name.toLowerCase();
        if (name.endsWith(".txt")) {
          text = await file.text();
        } else if (name.endsWith(".pdf")) {
          updateStage("extracting", "Extracting PDF text…");
          text = await extractPdf(file);
        } else if (name.endsWith(".docx")) {
          updateStage("extracting", "Extracting DOCX text…");
          text = await extractDocx(file);
        } else {
          throw new Error("Unsupported file type. Use PDF, DOCX or TXT.");
        }

        if (!text || text.trim().length < 80) {
          throw new Error("Could not extract enough text from the file.");
        }

        updateStage("parsing", "Parsing with AI…");
        const result = await aiService.parseResume(text);
        onParsed(result.resume, {
          confidence: result.confidence,
          warnings: result.warnings ?? [],
          fileName: file.name,
        });
        updateStage("done", "Imported");
        toast({
          title: "Resume imported",
          description: `Confidence ${Math.round(result.confidence * 100)}% · ${file.name}`,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Import failed.";
        setProgress({ stage: "error", message: msg, percent: 0 });
        toast({ title: "Import failed", description: msg });
      }
    },
    [onParsed, updateStage],
  );

  /* Reset "done" / "error" badge after a moment so the UI returns to idle. */
  useEffect(() => {
    if (progress.stage !== "done" && progress.stage !== "error") return;
    const id = window.setTimeout(
      () => setProgress({ stage: "idle", message: "", percent: 0 }),
      2500,
    );
    return () => window.clearTimeout(id);
  }, [progress.stage]);

  /* Drag & drop support. */
  useEffect(() => {
    const node = dropRef.current;
    if (!node) return;
    const stop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onEnter = (e: DragEvent) => {
      stop(e);
      setDragOver(true);
    };
    const onLeave = (e: DragEvent) => {
      stop(e);
      setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      stop(e);
      setDragOver(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) void handleFile(f);
    };
    node.addEventListener("dragenter", onEnter);
    node.addEventListener("dragover", stop);
    node.addEventListener("dragleave", onLeave);
    node.addEventListener("drop", onDrop);
    return () => {
      node.removeEventListener("dragenter", onEnter);
      node.removeEventListener("dragover", stop);
      node.removeEventListener("dragleave", onLeave);
      node.removeEventListener("drop", onDrop);
    };
  }, [handleFile]);

  return (
    <div
      ref={dropRef}
      className={`rounded-2xl border border-dashed bg-white p-4 transition dark:bg-gray-900 ${
        dragOver
          ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
          : "border-gray-300 dark:border-gray-700"
      }`}
      role="region"
      aria-label="Import resume"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
          <FileUp className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Import an existing resume
          </p>
          <p className="text-xs text-gray-500">
            Drag & drop or choose a PDF, DOCX, or TXT. Fields will autofill below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-3.5 w-3.5" aria-hidden />
          )}
          {busy ? progress.message || "Working…" : "Choose file"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {progress.stage !== "idle" && (
        <div className="mt-3" aria-live="polite">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full transition-[width] duration-500 ease-out ${
                progress.stage === "error"
                  ? "bg-rose-500"
                  : progress.stage === "done"
                    ? "bg-emerald-500"
                    : "bg-indigo-500"
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p
            className={`mt-1 text-[11px] ${
              progress.stage === "error"
                ? "text-rose-600"
                : progress.stage === "done"
                  ? "text-emerald-600"
                  : "text-gray-500"
            }`}
          >
            {progress.message}
          </p>
        </div>
      )}

      <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden />
        Files are processed locally; only the extracted text is sent to AI.
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
        <AlertTriangle className="h-3 w-3" aria-hidden />
        For PDF/DOCX support install{" "}
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">pdfjs-dist</code>{" "}
        and{" "}
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">mammoth</code>.
      </p>
    </div>
  );
}

export default memo(ResumeImportPanel);

/* ---------------- file readers (dynamic imports) ---------------- */

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist").catch(() => {
    throw new Error("pdfjs-dist is not installed. Run: pnpm add pdfjs-dist");
  });
  // Configure the worker exactly once across imports.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      const workerUrl = (
        await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
      ).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      /* fall back to default worker */
    }
  }
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((it) => ("str" in it ? it.str : "")).join(" "),
    );
  }
  return pages.join("\n\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth").catch(() => {
    throw new Error("mammoth is not installed. Run: pnpm add mammoth");
  });
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value;
}