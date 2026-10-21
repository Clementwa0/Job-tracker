"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/lib/resume/pdf";
import { resumeToText } from "@/lib/resume/ats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumes } from "@/lib/resume/storage";
import { ACCENTS, TEMPLATES, type ResumeData } from "@/lib/resume/types";
import { ResumeDocument, PAGE_H, PAGE_W } from "./components/templates";
import { ContentEditor } from "./components/editors";
import { AtsPanel, JobMatchPanel } from "./components/panels";

export default function ResumeBuilderPage({ id }: { id: string }) {
  const router = useRouter();
  const { resumes, ready, save } = useResumes();
  const [data, setData] = useState<ResumeData | null>(null);
  const [saved, setSaved] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const onDownload = async () => {
    if (!exportRef.current || !data) return;
    setExporting(true);
    try {
      await downloadPdf(exportRef.current, data.contact.fullName || data.meta?.name || "resume");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  const onDownloadText = () => {
    if (!data) return;
    try {
      const text = resumeToText(data);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (data.contact.fullName || data.meta?.name || "resume").replace(/[^\w\- ]+/g, "").trim() + ".txt";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Plain-text resume saved — ATS systems can read this file.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create the text file. Please try again.");
    }
  };

  useEffect(() => {
    if (ready && !data) setData(resumes.find((r) => r.meta?.id === id) ?? null);
  }, [ready, resumes, id, data]);

  useEffect(() => {
    if (!data || saved) return;
    const t = setTimeout(() => { save(data); setSaved(true); }, 600);
    return () => clearTimeout(t);
  }, [data, saved, save]);

  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const update = (next: ResumeData) => { setData(next); setSaved(false); };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!data)
    return (
      <div className="grid min-h-screen place-items-center bg-background text-center">
        <div>
          <p className="font-display text-2xl">Resume not found</p>
          <Button className="mt-4" onClick={() => router.push("/jobseeker/resumes")}>Back to resumes</Button>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-2 border-b border-border px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => router.push("/jobseeker/resumes")}><ArrowLeft /></Button>
        <Input
          value={data.meta?.name ?? ""}
          onChange={(e) => {
            const now = Date.now();
            update({
              ...data,
              meta: data.meta
                ? { ...data.meta, name: e.target.value }
                : { id, name: e.target.value, createdAt: now, updatedAt: now },
            });
          }}
          className="h-9 min-w-0 max-w-xs flex-1 border-transparent bg-transparent font-display text-lg font-semibold shadow-none hover:border-border"
        />
        <span className="hidden shrink-0 items-center gap-1 text-xs sm:flex text-muted-foreground">{saved ? <><Check className="size-3" /> Saved</> : "Saving…"}</span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button variant="outline" onClick={onDownloadText} disabled={!data} aria-label="Download text" className="px-2.5 sm:px-4">
            <FileText /> <span className="hidden sm:inline">Download text</span>
          </Button>
          <Button onClick={onDownload} disabled={exporting} aria-label="Download PDF" className="px-2.5 sm:px-4">{exporting ? <Loader2 className="animate-spin" /> : <Download />} <span className="hidden sm:inline">{exporting ? "Preparing…" : "Download PDF"}</span></Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,520px)_1fr]">
        <aside className={`min-h-0 overflow-y-auto border-border pb-20 lg:block lg:border-r lg:pb-0 ${mobileView === "preview" ? "hidden" : ""}`}>
          <Tabs defaultValue="content" className="p-3 sm:p-4">
            <TabsList className="grid w-full grid-cols-4 [&>button]:px-1 [&>button]:text-xs sm:[&>button]:text-sm">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="ats">ATS</TabsTrigger>
              <TabsTrigger value="match">Job match</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4"><ContentEditor data={data} onChange={update} /></TabsContent>
            <TabsContent value="design" className="mt-4 space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold">Template</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update({ ...data, template: t.id })}
                      className={`rounded-md border p-3 text-left transition-colors ${data.template === t.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted"}`}
                    >
                      <div className="font-display font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Accent colour</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENTS.map((c) => (
                    <button key={c} aria-label={`Accent ${c}`} onClick={() => update({ ...data, accent: c })}
                      className={`size-8 rounded-full ring-offset-2 ring-offset-background ${data.accent === c ? "ring-2 ring-foreground" : ""}`}
                      style={{ background: c }} />
                  ))}
                  <input type="color" aria-label="Custom accent" value={data.accent} onChange={(e) => update({ ...data, accent: e.target.value })} className="size-8 cursor-pointer rounded-full border border-border bg-transparent" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ats" className="mt-4"><AtsPanel data={data} /></TabsContent>
            <TabsContent value="match" className="mt-4"><JobMatchPanel data={data} /></TabsContent>
          </Tabs>
        </aside>
        <Preview data={data} visible={mobileView === "preview"} />
      </div>
      <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center lg:hidden">
        <div className="flex rounded-full border border-border bg-card p-1 shadow-lg">
          {(["edit", "preview"] as const).map((v) => (
            <button key={v} onClick={() => setMobileView(v)}
              className={`rounded-full px-5 py-2 text-sm font-medium capitalize ${mobileView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{v}</button>
          ))}
        </div>
      </div>
      <div aria-hidden style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: PAGE_W }}><ResumeDocument data={data} /></div>
      </div>
    </div>
  );
}

function Preview({ data, visible }: { data: ResumeData; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [pageCount, setPageCount] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => el.clientWidth && setScale(Math.min(1, (el.clientWidth - (el.clientWidth < 640 ? 24 : 64)) / PAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const updatePageCount = () => setPageCount(Math.max(1, Math.ceil(el.scrollHeight / PAGE_H)));
    updatePageCount();
    const ro = new ResizeObserver(updatePageCount);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);
  return (
    <div ref={ref} className={`min-h-0 overflow-auto bg-desk pb-24 pt-4 sm:py-8 lg:block ${visible ? "block" : "hidden"}`}>
      <div style={{ width: PAGE_W * scale, height: pageCount * PAGE_H * scale, margin: "0 auto" }}>
        <div style={{ position: "relative", width: PAGE_W, minHeight: pageCount * PAGE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div ref={contentRef} style={{ position: "relative", zIndex: 1 }}>
            <ResumeDocument data={data} />
          </div>
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
            {Array.from({ length: pageCount }, (_, index) => (
              <div
                key={index}
                className="shadow-paper"
                style={{
                  position: "absolute",
                  top: index * PAGE_H,
                  left: 0,
                  width: PAGE_W,
                  height: PAGE_H,
                  border: "1px solid var(--color-border)",
                  boxSizing: "border-box",
                }}
              >
                <span className="bg-desk text-muted-foreground" style={{ position: "absolute", top: 8, right: -52, padding: "2px 6px", fontSize: 11, lineHeight: 1.4 }}>
                  {index + 1} / {pageCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
