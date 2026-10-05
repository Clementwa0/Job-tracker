"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, FilePlus2, FileUp, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { getApiErrorMessage } from "@/lib/apiError";
import { ScaledResume } from "@/features/jobseeker/resumes/components/templates";
import { scoreResume } from "@/lib/resume/ats";
import { useResumes } from "@/lib/resume/storage";
import { EMPTY_RESUME, SAMPLE_RESUME, TEMPLATES, normalizeResume, type ResumeData } from "@/lib/resume/types";
import type { ApiSuccessResponse } from "@/types/api";

const IMPORT_STAGES = [
  "Reading CV...",
  "Understanding your experience...",
  "Improving resume content...",
  "Optimizing for ATS...",
  "Preparing your resume...",
] as const;

type ImportResponse = ApiSuccessResponse<Record<string, unknown>> & {
  improvements?: { experience?: boolean; summary?: boolean; skills?: boolean };
};

export default function ResumesPage() {
  const { resumes, ready, create, remove, duplicate } = useResumes();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [stage, setStage] = useState(0);

  // The import is a single request, so the stages advance on a timer and hold on the last one until it returns.
  useEffect(() => {
    if (!importing) return;
    const timer = window.setInterval(() => setStage((current) => Math.min(current + 1, IMPORT_STAGES.length - 1)), 2500);
    return () => window.clearInterval(timer);
  }, [importing]);

  const start = (sample: boolean, template = SAMPLE_RESUME.template) => {
    const selected = TEMPLATES.find((item) => item.id === template)!;
    const base = sample
      ? { ...SAMPLE_RESUME, template, accent: selected.accent }
      : { ...EMPTY_RESUME, template, accent: selected.accent };
    const id = create(base, sample ? `${selected.name} resume` : "Untitled resume");
    router.push(`/jobseeker/resumes/${id}`);
  };

  const importResume = async (file?: File) => {
    if (!file) return;
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
      toast.error("Choose a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume files must be 5 MB or smaller.");
      return;
    }

    setStage(0);
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await axiosInstance.post<ImportResponse>("/resumes/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resume = normalizeResume(response.data.data as Partial<ResumeData> & Record<string, unknown>);
      const baseName = file.name.replace(/\.[^.]+$/, "").trim() || "Imported resume";
      const id = create(resume, baseName);
      const { improvements } = response.data;
      const summary = [
        improvements?.experience && "✓ Experience improved",
        improvements?.summary && "✓ Summary improved",
        improvements?.skills && "✓ Skills organized",
        `✓ ATS check complete (score ${scoreResume(resume).score}/100)`,
      ].filter(Boolean).join("\n");
      toast.success("Resume imported. Review the details before downloading.", {
        description: <span className="whitespace-pre-line">{summary}</span>,
        duration: 10_000,
      });
      router.push(`/jobseeker/resumes/${id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error), { action: { label: "Retry", onClick: () => void importResume(file) } });
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Resume builder</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, and download resumes with six professional templates and a built-in ATS checklist.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInput} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void importResume(file); }} />
          <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={importing}>{importing ? <Loader2 className="animate-spin" /> : <FileUp />}{importing ? "Importing…" : "Import a resume"}</Button>
          <Button onClick={() => start(false)}><FilePlus2 /> Create a resume</Button>
        </div>
      </section>

      {importing && (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm space-y-3 p-6 shadow-lg">
            <h2 className="font-display text-lg font-semibold">Rebuilding your resume</h2>
            <ul className="space-y-2 text-sm">
              {IMPORT_STAGES.map((label, index) => (
                <li key={label} className={`flex items-center gap-2 ${index > stage ? "text-muted-foreground/60" : ""}`}>
                  {index < stage ? <Check className="size-4 text-success" /> : index === stage ? <Loader2 className="size-4 animate-spin text-primary" /> : <span className="size-4" />}
                  {label}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {ready && resumes.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your resumes</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const id = resume.meta!.id;
              return (
                <Card key={id} className="overflow-hidden border-border p-3 shadow-none">
                  <Link href={`/jobseeker/resumes/${id}`} className="resume-paper block overflow-hidden rounded-md shadow-md transition-transform hover:-translate-y-0.5">
                    <ScaledResume data={resume} width={420} />
                  </Link>
                  <div className="flex items-start justify-between gap-2 px-1 pt-3">
                    <Link href={`/jobseeker/resumes/${id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{resume.meta!.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {TEMPLATES.find((template) => template.id === resume.template)?.name} · Updated {new Date(resume.meta!.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                    <div className="flex shrink-0">
                      <Button size="icon-sm" variant="ghost" aria-label={`Duplicate ${resume.meta!.name}`} onClick={() => duplicate(id)}><Copy /></Button>
                      <Button size="icon-sm" variant="ghost" aria-label={`Delete ${resume.meta!.name}`} onClick={() => { if (window.confirm("Delete this resume?")) remove(id); }}><Trash2 /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start with a template</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <button key={template.id} onClick={() => start(true, template.id)} className="group min-w-0 text-left">
              <div className="resume-paper overflow-hidden rounded-md shadow-md transition-transform group-hover:-translate-y-0.5">
                <ScaledResume data={{ ...SAMPLE_RESUME, template: template.id, accent: template.accent }} width={420} />
              </div>
              <span className="mt-3 block font-display text-lg font-semibold">{template.name}</span>
              <span className="text-sm text-muted-foreground">{template.tagline}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
