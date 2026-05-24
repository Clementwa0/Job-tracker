import { useRef } from "react";
import { Download, Printer, Upload, RotateCcw, FileJson, Undo2, Redo2, CheckCircle2 } from "lucide-react";
import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: ResumeData;
  onChangeTemplate: (t: ResumeTemplate) => void;
  onChangeAccent: (a: string) => void;
  onReset: () => void;
  onImport: (d: ResumeData) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  savedAt?: number | null;
}

const TEMPLATES: { id: ResumeTemplate; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "compact", label: "Compact" },
  { id: "executive", label: "Executive" },
  { id: "minimal", label: "Minimal" },
];

const ACCENTS = ["#2563eb", "#0f172a", "#7c3aed", "#059669", "#dc2626", "#d97706", "#0891b2", "#db2777"];

export default function ResumeToolbar({
  data,
  onChangeTemplate,
  onChangeAccent,
  onReset,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  savedAt,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.contact.fullName || data.meta?.name || "resume").replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (f: File) => {
    try {
      const text = await f.text();
      const parsed = JSON.parse(text);
      onImport(parsed);
      toast({ title: "Resume loaded", description: f.name });
    } catch {
      toast({ title: "Invalid file", description: "Could not parse JSON." });
    }
  };

  const savedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/60">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTemplate(t.id)}
              aria-pressed={data.template === t.id}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                data.template === t.id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Accent</span>
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeAccent(c)}
              aria-label={`Accent ${c}`}
              aria-pressed={data.accent === c}
              className={`h-5 w-5 rounded-full border-2 transition ${
                data.accent === c ? "border-gray-900 dark:border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {(onUndo || onRedo) && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Undo (⌘Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {savedLabel && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {savedLabel}
          </span>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
          />
          <button
            type="button"
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <FileJson className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 dark:bg-white dark:text-gray-900"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear all resume data?")) onReset();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-rose-950/30"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>
      <p className="text-[11px] text-gray-500">
        <Download className="mr-1 inline h-3 w-3" />
        Use “Print / PDF” and choose <strong>Save as PDF</strong> for a pixel-perfect resume.
      </p>
    </div>
  );
}
