import { Download, Printer, RotateCcw, Undo2, Redo2, FileDown, Palette, LayoutTemplate, Check } from "lucide-react";
import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { hex: "#2563eb", name: "Royal Blue" },
  { hex: "#0f172a", name: "Slate Dark" },
  { hex: "#7c3aed", name: "Violet" },
  { hex: "#059669", name: "Emerald Green" },
  { hex: "#dc2626", name: "Crimson Red" },
  { hex: "#d97706", name: "Amber Orange" },
  { hex: "#0891b2", name: "Cyan Sea" },
  { hex: "#db2777", name: "Deep Pink" },
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

  const activeTemplateLabel = TEMPLATES.find((t) => t.id === data.template)?.label || "Select Template";
  const activeAccentColor = ACCENTS.find((a) => a.hex === data.accent)?.hex || "#2563eb";

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

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
      remainingHeight -= pdfHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
        remainingHeight -= pdfHeight;
      }

      const filename = `${(data.contact.fullName || "resume").trim().replace(/\s+/g, "_")}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Interactive Configuration Block */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Shadcn Template Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-700 dark:text-slate-300">
                <LayoutTemplate className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium">Layout: <b>{activeTemplateLabel}</b></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Choose Layout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TEMPLATES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => onChangeTemplate(t.id)}
                  className="flex items-center justify-between text-xs cursor-pointer py-2"
                >
                  {t.label}
                  {data.template === t.id && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-white" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Shadcn Color Accent Palette Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-700 dark:text-slate-300">
                <div 
                  className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-sm transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: activeAccentColor }} 
                />
                <Palette className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium">Theme Accent</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">Accent Branding Color</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <div className="grid grid-cols-4 gap-1.5 p-1">
                {ACCENTS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => onChangeAccent(c.hex)}
                    className="relative flex h-9 w-full items-center justify-center rounded-lg border border-black/5 dark:border-white/5 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  >
                    {data.accent === c.hex && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur-xs dark:bg-slate-950/90 dark:text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Undo/Redo Engine Blocks */}
          {(onUndo || onRedo) && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5 dark:border-slate-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                title="Undo (⌘Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                title="Redo (⌘⇧Z)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Content Engine Call-To-Action Blocks */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={exportPdf} disabled={exporting} className="h-9 font-medium text-xs shadow-xs">
            <FileDown className="mr-1.5 h-4 w-4" />
            {exporting ? "Compiling..." : "Download PDF"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <Printer className="mr-1.5 h-4 w-4 text-slate-400" />
            Print Layout
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to completely flush and reset all resume fields?")) {
                onReset();
              }
            }}
            className="h-9 text-xs font-medium border-rose-200/60 text-rose-600 bg-rose-50/30 hover:bg-rose-50 dark:border-rose-950/40 dark:text-rose-400 dark:bg-transparent dark:hover:bg-rose-950/20"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border pt-2">
        <Download className="h-3 w-3" />
        <span>
          {exporting
            ? "Generating PDF… this may take a few seconds."
            : "Choose a layout and accent color, then download or print your resume."}
        </span>
      </div>
    </div>
  );
}