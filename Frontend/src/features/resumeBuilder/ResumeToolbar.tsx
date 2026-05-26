import { memo, useCallback, useRef } from "react";
import {
  Download,
  Printer,
  Upload,
  RotateCcw,
  FileJson,
  Undo2,
  Redo2,
  CheckCircle2,
} from "lucide-react";
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

/* Module-scope constants — never recreated. */
const TEMPLATES: readonly { id: ResumeTemplate; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "compact", label: "Compact" },
  { id: "executive", label: "Executive" },
  { id: "minimal", label: "Minimal" },
] as const;

const ACCENTS: readonly string[] = [
  "#2563eb",
  "#0f172a",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#d97706",
  "#0891b2",
  "#db2777",
] as const;

const TIME_FMT = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
});

function ResumeToolbar({
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

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.contact.fullName || data.meta?.name || "resume").replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJSON = useCallback(
    async (f: File) => {
      try {
        const text = await f.text();
        const parsed = JSON.parse(text) as ResumeData;
        onImport(parsed);
        toast({ title: "Resume loaded", description: f.name });
      } catch {
        toast({ title: "Invalid file", description: "Could not parse JSON." });
      }
    },
    [onImport],
  );

  const onReset_ = useCallback(() => {
    if (confirm("Clear all resume data?")) onReset();
  }, [onReset]);

  const savedLabel = savedAt ? `Saved ${TIME_FMT.format(new Date(savedAt))}` : "";

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/60"
          role="tablist"
          aria-label="Template"
        >
          {TEMPLATES.map((t) => {
            const selected = data.template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChangeTemplate(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selected
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          className="flex items-center gap-1.5"
          role="radiogroup"
          aria-label="Accent color"
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Accent
          </span>
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              onClick={() => onChangeAccent(c)}
              aria-label={`Accent ${c}`}
              aria-checked={data.accent === c}
              className={`h-5 w-5 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                data.accent === c
                  ? "border-gray-900 dark:border-white"
                  : "border-transparent"
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
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}

        {savedLabel && (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400"
            aria-live="polite"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden /> {savedLabel}
          </span>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJSON(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <FileJson className="h-3.5 w-3.5" aria-hidden /> Export JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-gray-900"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden /> Print / PDF
          </button>
          <button
            type="button"
            onClick={onReset_}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-rose-950/30"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
          </button>
        </div>
      </div>
      <p className="text-[11px] text-gray-500">
        <Download className="mr-1 inline h-3 w-3" aria-hidden />
        Use “Print / PDF” and choose <strong>Save as PDF</strong> for a pixel-perfect resume.
      </p>
    </div>
  );
}

export default memo(ResumeToolbar);