"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentEditor } from "@/features/jobseeker/resumes/components/editors";
import {
  ResumeDocument,
  PAGE_GAP,
  PAGE_H,
  PAGE_W,
} from "@/features/jobseeker/resumes/components/templates";
import {
  AtsPanel,
  JobMatchPanel,
} from "@/features/jobseeker/resumes/components/panels";
import { ImproveDialog } from "@/features/jobseeker/resumes/components/ImproveDialog";
import { useResumeImprovement } from "@/features/jobseeker/resumes/useResumeImprovement";
import {
  useResumeAssist,
  type ResumeAssistController,
} from "@/features/jobseeker/resumes/useResumeAssist";
import {
  applyAssistSuggestion,
  applyChanges,
  type ImproveScope,
  type ResumeChange,
} from "@/lib/resume/improve";
import { useResumes } from "@/lib/resume/storage";
import { ACCENTS, TEMPLATES, type ResumeData } from "@/lib/resume/types";
import { downloadPdf } from "@/lib/resume/pdf";
import { resumeToText } from "@/lib/resume/ats";

export default function ResumeBuilderPage({ id }: { id: string }) {
  const { resumes, ready, save } = useResumes();
  const [editedData, setEditedData] = useState<ResumeData | null>(null);
  const data =
    editedData ??
    (ready ? (resumes.find((resume) => resume.meta?.id === id) ?? null) : null);
  const [saved, setSaved] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [pageCount, setPageCount] = useState(1);
  const exportRef = useRef<HTMLDivElement>(null);
  const improvement = useResumeImprovement();
  const assist = useResumeAssist();
  const busy = improvement.loading || assist.loading;

  useEffect(() => {
    if (!data || saved) return;
    const timer = window.setTimeout(() => {
      save(data);
      setSaved(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [data, saved, save]);

  const update = (next: ResumeData) => {
    setEditedData(next);
    setSaved(false);
  };

  const improve = (scope: ImproveScope) => {
    if (data && !busy)
      void improvement.start({ action: "improve_resume", scope }, data);
  };

  const tailor = (jobDescription: string) => {
    if (data && !busy)
      void improvement.start({ action: "tailor_to_job", jobDescription }, data);
  };

  const ai: ResumeAssistController = {
    stateFor: assist.stateFor,
    busy,
    run: (action, target) => {
      if (data && !busy) void assist.start(action, target, data);
    },
    cancel: assist.cancel,
    use: () => {
      if (assist.state.status !== "suggestion" || !data) return;
      const next = applyAssistSuggestion(data, assist.state.suggestion);
      if (next) {
        update(next);
        toast.success("AI suggestion applied.");
      } else {
        toast.error(
          "That text changed after the suggestion was made. Please try again.",
        );
      }
      assist.cancel();
    },
  };

  const acceptChanges = (accepted: ResumeChange[]) => {
    if (data && accepted.length) {
      // Checked against the latest resume: a change whose field was edited since the AI made it is skipped, never applied.
      const result = applyChanges(data, accepted);
      if (result.applied.length) {
        update(result.data);
        toast.success(
          `${result.applied.length} AI improvement${result.applied.length > 1 ? "s" : ""} applied.`,
        );
      }
      if (result.stale.length)
        toast.warning(
          `${result.stale.length} suggestion${result.stale.length > 1 ? "s were" : " was"} skipped because you edited that content.`,
        );
    }
    improvement.close();
  };

  const onDownload = async () => {
    if (!exportRef.current || !data) return;
    setExporting(true);
    try {
      await downloadPdf(
        exportRef.current,
        data.contact.fullName || data.meta?.name || "resume",
        pageCount,
      );
    } catch (error) {
      console.error(error);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const onDownloadText = () => {
    if (!data) return;
    const text = resumeToText(data);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(data.contact.fullName || data.meta?.name || "resume").replace(/[^\w\- ]+/g, "").trim() || "resume"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Plain-text resume downloaded.");
  };

  if (!ready) return <div className="min-h-[60vh] animate-pulse bg-muted/30" />;
  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">
            Resume not found
          </p>
          <Link
            href="/jobseeker/resumes"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to resumes
          </Link>
        </div>
      </div>
    );
  }

  const completedSections = [
    Boolean(data.contact.fullName && data.contact.email),
    Boolean(data.summary),
    data.experience.length > 0,
    data.skills.length > 0,
    data.education.length > 0,
  ].filter(Boolean).length;
  const readiness = Math.round((completedSections / 5) * 100);

  return (
    <div className="resume-builder-shell relative -mx-4 -my-6 flex h-[calc(100dvh-4rem)] min-h-[620px] flex-col overflow-hidden bg-background text-foreground sm:-mx-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-52 h-[34rem] w-[48rem] -rotate-12 rounded-[3rem] bg-primary/10 blur-sm motion-safe:animate-[resume-drift_14s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-32 h-[30rem] w-[42rem] -rotate-12 rounded-[3rem] bg-accent/50 blur-md motion-safe:animate-[resume-drift_18s_ease-in-out_infinite]"
      />

      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-2 backdrop-blur-xl sm:px-4">
        <Link
          href="/jobseeker/resumes"
          aria-label="Back to resumes"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-xs font-black text-background">
          R
        </div>
        <div className="min-w-0">
          <Input
            value={data.meta?.name ?? ""}
            onChange={(event) =>
              update({
                ...data,
                meta: { ...data.meta, name: event.target.value },
              })
            }
            className="h-6 min-w-0 max-w-56 border-0 bg-transparent px-1 text-sm font-bold shadow-none focus-visible:ring-1"
            aria-label="Resume name"
          />
          <p className="px-1 text-[10px] font-medium text-muted-foreground">
            Draft · {pageCount} {pageCount === 1 ? "page" : "pages"}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-md border border-border bg-card/70 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
            <span
              className={`size-1.5 rounded-full ${saved ? "bg-primary" : "bg-muted-foreground"}`}
            />
            {saved ? "Saved" : "Saving…"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadText}
            aria-label="Download plain text"
            className="hidden md:inline-flex"
          >
            <FileText className="size-3.5" /> Text
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
            disabled={exporting}
            aria-label="Export resume as PDF"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {exporting ? "Preparing…" : "Export PDF"}
            </span>
          </Button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <aside
          className={`relative w-full shrink-0 overflow-y-auto border-r border-border bg-card/55 pb-24 backdrop-blur-xl md:w-[360px] lg:pb-0 xl:w-[390px] ${mobileView === "preview" ? "hidden md:block" : "block"}`}
        >
          <Tabs defaultValue="content" className="min-h-full">
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 px-3 py-2.5 backdrop-blur-xl">
              <TabsList className="grid h-9 w-full grid-cols-4 bg-muted/70 p-1 [&>button]:px-1 [&>button]:text-[11px] [&>button]:font-semibold">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="ats">ATS</TabsTrigger>
                <TabsTrigger value="job-match">Match</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-3 sm:p-4">
              <TabsContent value="content" className="mt-0">
                <ContentEditor data={data} onChange={update} ai={ai} />
              </TabsContent>
              <TabsContent value="design" className="mt-0 space-y-6">
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold uppercase text-muted-foreground">
                      Templates
                    </h2>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {TEMPLATES.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        type="button"
                        variant="outline"
                        onClick={() =>
                          update({
                            ...data,
                            template: template.id,
                            accent: template.accent,
                          })
                        }
                        className={`h-auto min-h-24 justify-start overflow-hidden p-2 text-left ${data.template === template.id ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card/70"}`}
                      >
                        <span className="flex min-w-0 flex-col items-start gap-1">
                          <span className="flex h-12 w-full flex-col gap-1 rounded-sm bg-muted p-2">
                            <span className="h-1 w-1/2 rounded bg-foreground" />
                            <span className="h-0.5 w-1/3 rounded bg-primary" />
                            <span className="mt-1 h-0.5 w-full rounded bg-muted-foreground/30" />
                            <span className="h-0.5 w-4/5 rounded bg-muted-foreground/30" />
                          </span>
                          <span className="max-w-full truncate text-xs font-semibold">
                            {template.name}
                          </span>
                          <span className="max-w-full truncate text-[10px] font-normal text-muted-foreground">
                            {template.tagline}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </section>
                <section className="border-t border-border pt-4">
                  <h2 className="mb-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Accent colour
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {ACCENTS.map((accent) => (
                      <Button
                        key={accent}
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Use accent ${accent}`}
                        onClick={() => update({ ...data, accent })}
                        className={`size-7 rounded-full p-0 ${data.accent === accent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      >
                        <span
                          className="size-full rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                      </Button>
                    ))}
                    <input
                      type="color"
                      aria-label="Custom accent colour"
                      value={data.accent}
                      onChange={(event) =>
                        update({ ...data, accent: event.target.value })
                      }
                      className="size-7 cursor-pointer rounded-full border border-border bg-transparent"
                    />
                  </div>
                </section>
              </TabsContent>
              <TabsContent value="ats" className="mt-0">
                <AtsPanel data={data} />
              </TabsContent>
              <TabsContent value="job-match" className="mt-0">
                <JobMatchPanel data={data} onTailor={tailor} tailoring={busy} />
              </TabsContent>
            </div>
          </Tabs>
        </aside>

        <section
          className={`relative min-w-0 flex-1 overflow-hidden ${mobileView === "edit" ? "hidden md:block" : "block"}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[75rem] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[3rem] bg-card/55 blur-sm"
          />
          <ResumePreview
            data={data}
            visible
            exportRef={exportRef}
            onPageCount={setPageCount}
          />
        </section>

        <aside className="relative hidden w-[292px] shrink-0 flex-col border-l border-border bg-card/55 backdrop-blur-xl 2xl:flex">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">
              AI assist
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {busy ? "Working" : "Ready"}
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <section className="rounded-md border border-border bg-background/70 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Resume readiness</span>
                <span className="text-xl font-bold text-primary">
                  {readiness}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {completedSections === 5
                  ? "All core sections are ready for review."
                  : `${5 - completedSections} core ${5 - completedSections === 1 ? "section needs" : "sections need"} attention.`}
              </p>
            </section>
            <section className="rounded-md border border-border bg-background/70 p-3">
              <h3 className="text-[11px] font-bold uppercase text-muted-foreground">
                Quick improvements
              </h3>
              <div className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                <p className="rounded-md bg-muted/70 p-2">
                  Lead experience bullets with outcomes and measurable impact.
                </p>
                <p className="rounded-md bg-muted/70 p-2">
                  Keep the summary specific to your target role.
                </p>
              </div>
            </section>
            <section className="rounded-md border border-border bg-background/70 p-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[11px] font-bold uppercase text-muted-foreground">
                  Document
                </h3>
                <span className="text-lg font-bold text-primary">
                  {pageCount}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A4 layout · {data.template} template · live preview
              </p>
            </section>
          </div>
          <div className="border-t border-border p-4">
            <Button
              className="w-full"
              onClick={() => improve({ section: "all" })}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {busy ? "Improving…" : "Improve with AI"}
            </Button>
          </div>
        </aside>
      </div>

      <ImproveDialog
        state={improvement.state}
        data={data}
        onClose={improvement.close}
        onRetry={() => {
          if (improvement.state.status === "error")
            void improvement.start(improvement.state.request, data);
        }}
        onApply={acceptChanges}
      />
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center md:hidden">
        <div className="flex rounded-lg border border-border bg-card/90 p-1 shadow-lg backdrop-blur-xl">
          {(["edit", "preview"] as const).map((view) => (
            <Button
              key={view}
              type="button"
              size="sm"
              variant={mobileView === view ? "default" : "ghost"}
              onClick={() => setMobileView(view)}
              className="min-w-24 capitalize"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResumePreview({
  data,
  visible = true,
  exportRef,
  onPageCount,
}: {
  data: ResumeData;
  visible?: boolean;
  exportRef: { current: HTMLDivElement | null };
  onPageCount: (count: number) => void;
}) {
  const [pageCount, setPageCount] = useState(1);
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const measure = () => setScale(Math.min(1, shell.clientWidth / PAGE_W));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const measure = () => {
      const page =
        exportRef.current?.querySelector<HTMLElement>(".resume-page");
      const count = Math.max(1, page?.getClientRects().length ?? 1);
      setPageCount(count);
      onPageCount(count);
    };
    const target = exportRef.current;
    const frame = window.requestAnimationFrame(measure);
    if (!target) return () => window.cancelAnimationFrame(frame);
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [data, onPageCount, exportRef]);

  const flowWidth = pageCount * PAGE_W + Math.max(0, pageCount - 1) * PAGE_GAP;
  return (
    <div
      ref={shellRef}
      className={`resume-print-shell relative h-full min-h-0 overflow-auto bg-transparent pb-24 pt-5 sm:p-8 lg:block ${visible ? "block" : "hidden"}`}
    >
      <div className="resume-preview-viewport resume-preview-viewport--vertical relative">
        <div
          className="flex flex-col items-center"
          style={{ gap: PAGE_GAP * scale }}
        >
          {Array.from({ length: pageCount }, (_, page) => (
            <div
              key={page}
              aria-hidden={page > 0}
              style={{
                width: PAGE_W * scale,
                height: PAGE_H * scale,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                className="resume-flow overflow-hidden rounded-sm shadow-2xl ring-1 ring-border"
                style={{
                  width: flowWidth,
                  height: PAGE_H,
                  columnCount: pageCount,
                  columnWidth: PAGE_W,
                  columnGap: PAGE_GAP,
                  transform: `scale(${scale}) translateX(${-page * (PAGE_W + PAGE_GAP)}px)`,
                  transformOrigin: "top left",
                }}
              >
                <ResumeDocument data={data} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="resume-export-source">
        <div
          ref={(element) => {
            exportRef.current = element;
          }}
          className="resume-flow"
          style={{
            width: flowWidth,
            height: PAGE_H,
            columnCount: pageCount,
            columnWidth: PAGE_W,
            columnGap: PAGE_GAP,
          }}
        >
          <ResumeDocument data={data} />
        </div>
      </div>
    </div>
  );
}
