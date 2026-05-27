import { Download, Printer, RotateCcw, Undo2, Redo2, FileDown } from "lucide-react";
import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";
import { Button } from "@/components/ui/button";
import { useState } from "react";


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

const TEMPLATES: {
  id: ResumeTemplate;
  label: string;
}[] = [
    { id: "modern", label: "Modern" },
    { id: "classic", label: "Classic" },
    { id: "compact", label: "Compact" },
    { id: "executive", label: "Executive" },
    { id: "minimal", label: "Minimal" },
  ];

const ACCENTS = [
  "#2563eb",
  "#0f172a",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#d97706",
  "#0891b2",
  "#db2777",
];

export default function ResumeToolbar({
  data,
  onChangeTemplate,
  onChangeAccent,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const [exporting, setExporting] = useState(false);
 
  const exportPdf = async () => {
  const element = document.getElementById("resume-print");

  if (!element) {
    console.error("resume-print element not found");
    return;
  }

  try {
    setExporting(true);

    const [{ toCanvas }, jsPDFModule] = await Promise.all([
      import("html-to-image"),
      import("jspdf"),
    ]);

    const { jsPDF } = jsPDFModule;

    // Wait for fonts/images to finish rendering
    await document.fonts.ready;

    const canvas = await toCanvas(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
      skipAutoScale: true,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let position = 0;
    let remainingHeight = scaledHeight;

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      pdfWidth,
      scaledHeight
    );

    remainingHeight -= pdfHeight;

    // Extra pages
    while (remainingHeight > 0) {
      position = remainingHeight - scaledHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        scaledHeight
      );

      remainingHeight -= pdfHeight;
    }

    const filename = `${
      (data.contact.fullName || "resume")
        .trim()
        .replace(/\s+/g, "_")
    }.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error(error);
    alert("Failed to generate PDF");
  } finally {
    setExporting(false);
  }
};

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-3">
        {/* Templates */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/60">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTemplate(t.id)}
              aria-pressed={data.template === t.id}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${data.template === t.id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Accent */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Accent
          </span>

          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeAccent(c)}
              aria-label={`Accent ${c}`}
              aria-pressed={data.accent === c}
              className={`h-5 w-5 rounded-full border-2 transition ${data.accent === c
                  ? "border-gray-900 dark:border-white"
                  : "border-transparent"
                }`}
              style={{
                backgroundColor: c,
              }}
            />
          ))}
        </div>

        {/* Undo Redo */}
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
        {/* Actions */}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" onClick={exportPdf} disabled={exporting}>
            <FileDown className="h-3.5 w-3.5" />
            {exporting ? "Generating…" : "Download PDF"}
          </Button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Clear all resume data?")) {
                onReset();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-rose-950/30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        <Download className="mr-1 inline h-3 w-3" />
        Download a high-quality PDF version of your resume.
      </p>
    </div>
  );
}
