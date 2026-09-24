"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import JobPostingForm, { emptyJobPostingForm } from "@/features/employer/components/JobPostingForm";
import JobPostingAiAssist from "@/features/employer/components/JobPostingAiAssist";
import JobPostingPreviewDialog from "@/features/employer/components/JobPostingPreviewDialog";
import PostingLifecycleActions from "@/features/employer/components/PostingLifecycleActions";
import PostingStatusBadge from "@/features/employer/components/PostingStatusBadge";
import { EmployerDashboardError, EmployerJobsEmptyState } from "@/features/employer/dashboard";
import { employerService } from "@/features/employer/services/employer.client";
import type { EmployerJobPayload, EmployerJobPosting, PostingStatus } from "@/types/employer";
import { getApiErrorMessage } from "@/lib/apiError";

type Filter = "all" | PostingStatus;

const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending review" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function formToEdit(job: EmployerJobPosting): EmployerJobPayload {
  return {
    companyName: job.companyName || job.company?.name || "",
    title: job.title,
    category: job.category || "",
    description: job.description,
    responsibilities: job.responsibilities || "",
    requirements: job.requirements || "",
    location: job.location || "",
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: job.salaryCurrency || "KES",
    jobType: job.jobType,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel || "",
    educationLevel: job.educationLevel || "",
    certifications: job.certifications || "",
    tags: job.tags,
    applyMethod: job.applyMethod,
    applicationDeadline: job.applicationDeadline ?? null,
  };
}

export default function EmployerJobPostingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<EmployerJobPosting[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [companyProfileExists, setCompanyProfileExists] = useState(false);

  const [editor, setEditor] = useState<EmployerJobPosting | "new" | null>(null);
  const [form, setForm] = useState<EmployerJobPayload>(emptyJobPostingForm);
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [{ jobs: jobList }, company] = await Promise.all([
        employerService.listJobs(),
        employerService.getCompany().catch(() => null),
      ]);
      setJobs(jobList);
      setCompanyProfileExists(!!company);
    } catch (err) {
      setLoadError(getApiErrorMessage(err) || "Couldn't load your job postings.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = useCallback((job: EmployerJobPosting | "new") => {
    setEditor(job);
    setForm(job === "new" ? { ...emptyJobPostingForm, tags: [] } : formToEdit(job));
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  // Deep-linkable: /employer/dashboard/jobs?edit=<id> opens that posting's
  // editor, and ?new=1 opens a fresh draft - used by dashboard shortcuts.
  useEffect(() => {
    if (!jobs) return;
    const editId = searchParams.get("edit");
    if (editId) {
      const match = jobs.find((job) => job.id === editId);
      if (match) open(match);
    } else if (searchParams.get("new") === "1") {
      open("new");
    }
  }, [jobs, searchParams, open]);

  const counts = useMemo(() => {
    const base = { all: 0, draft: 0, pending_review: 0, published: 0, closed: 0 } as Record<Filter, number>;
    for (const job of jobs ?? []) {
      base.all += 1;
      base[job.status] += 1;
    }
    return base;
  }, [jobs]);

  const totalViews = useMemo(
    () => (jobs ?? []).reduce((sum, job) => sum + job.viewCount, 0),
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (jobs ?? [])
      .filter((job) => filter === "all" || job.status === filter)
      .filter((job) => !q || job.title.toLowerCase().includes(q) || (job.location ?? "").toLowerCase().includes(q));
  }, [jobs, filter, query]);

  const clearDeepLink = () => {
    if (searchParams.get("edit") || searchParams.get("new")) {
      router.replace("/employer/dashboard/jobs");
    }
  };

  const closeEditor = () => {
    setEditor(null);
    clearDeepLink();
  };

  const ensureCompanyProfile = async () => {
    if (companyProfileExists) return;
    if (!form.companyName?.trim()) {
      throw new Error("Create a company profile before posting jobs.");
    }
    await employerService.createCompany({ name: form.companyName.trim() });
    setCompanyProfileExists(true);
  };

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await ensureCompanyProfile();
      if (editor === "new") await employerService.createJob(form);
      else if (editor) await employerService.updateJob(editor.id, form);
      toast.success(editor === "new" ? "Draft saved." : "Posting updated.");
      closeEditor();
      await load();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (message.toLowerCase().includes("company profile")) {
        toast.error("Create your company profile first.", {
          description: "Job postings must belong to a company.",
          action: { label: "Create profile", onClick: () => router.push("/employer/dashboard/company") },
        });
      } else {
        toast.error(message || "Couldn't save posting.");
      }
    } finally {
      setBusy(false);
    }
  };

  // Saves the current fields, then transitions the posting to "published" -
  // a single primary action for the common create-and-go-live flow. Reuses
  // the same create/update + transition calls the rest of the lifecycle
  // already relies on; no duplicate business logic.
  const saveAndPublish = async () => {
    setBusy(true);
    try {
      await ensureCompanyProfile();
      const saved = editor === "new"
        ? await employerService.createJob(form)
        : editor
          ? await employerService.updateJob(editor.id, form)
          : null;
      const id = saved?.id ?? (editor !== "new" ? editor?.id : undefined);
      if (id) await employerService.publishJob(id);
      toast.success("Posting published.");
      closeEditor();
      await load();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (message.toLowerCase().includes("company profile")) {
        toast.error("Create your company profile first.", {
          description: "Job postings must belong to a company.",
          action: { label: "Create profile", onClick: () => router.push("/employer/dashboard/company") },
        });
      } else {
        toast.error(message || "Couldn't publish posting.");
      }
    } finally {
      setBusy(false);
    }
  };

  const act = async (job: EmployerJobPosting, action: "publish" | "unpublish" | "close" | "delete") => {
    setBusy(true);
    try {
      if (action === "publish") await employerService.publishJob(job.id);
      else if (action === "unpublish") await employerService.unpublishJob(job.id);
      else if (action === "close") await employerService.closeJob(job.id);
      else await employerService.deleteJob(job.id);
      toast.success(
        action === "delete" ? "Draft deleted." : `Posting ${action === "close" ? "closed" : `${action}ed`}.`,
      );
      closeEditor();
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loadError && jobs === null) {
    return <EmployerDashboardError message={loadError} onRetry={load} />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Posting management</p>
          <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">Job postings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create drafts, publish roles, and monitor listing views.
          </p>
        </div>
        <Button onClick={() => open("new")}>
          <Plus />
          New job posting
        </Button>
      </div>

      {jobs === null ? (
        <JobsWorkspaceSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip label="Total postings" value={counts.all} />
            <StatChip label="Published" value={counts.published} accent="text-emerald-600 dark:text-emerald-400" />
            <StatChip label="Drafts" value={counts.draft} />
            <StatChip label="Total views" value={totalViews} icon={<Eye className="h-3.5 w-3.5" />} />
          </div>

          {editor !== null && (
            <Card ref={editorRef} className="scroll-mt-6 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    {editor === "new" ? "Create job posting" : "Edit posting"}
                  </h2>
                  {editor !== "new" && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{editor.title}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={closeEditor} aria-label="Close editor">
                  <X />
                </Button>
              </div>
              <JobPostingAiAssist
                onApply={(patch) => setForm((current) => ({ ...current, ...patch }))}
                defaultLocation={form.location}
              />
              <JobPostingForm
                value={form}
                onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
                onSaveDraft={saveDraft}
                onPreview={() => setPreviewOpen(true)}
                onPublish={
                  editor === "new" || editor.status === "draft" || editor.status === "closed"
                    ? () => void saveAndPublish()
                    : undefined
                }
                isSubmitting={busy}
                extraActions={
                  editor !== "new" ? (
                    <PostingLifecycleActions
                      posting={editor}
                      onUnpublish={() => void act(editor, "unpublish")}
                      onClose={() => void act(editor, "close")}
                      onDelete={() => void act(editor, "delete")}
                      acting={busy}
                    />
                  ) : undefined
                }
              />
            </Card>
          )}

          <JobPostingPreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            value={form}
          />

          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList>
                  {TABS.map(({ value, label }) => (
                    <TabsTrigger key={value} value={value}>
                      {label}
                      {counts[value] > 0 && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground">{counts[value]}</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or location"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            {loadError ? (
              <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
            ) : visibleJobs.length === 0 ? (
              counts.all === 0 ? (
                <EmployerJobsEmptyState onPostJob={() => open("new")} />
              ) : (
                <EmployerJobsEmptyState
                  title="No postings match"
                  description="Try a different tab or clear your search."
                />
              )
            ) : (
              <>
                {/* Table - sm and up */}
                <div className="mt-3 hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Job title
                        </TableHead>
                        <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Posted
                        </TableHead>
                        <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Views
                        </TableHead>
                        <TableHead className="h-8 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleJobs.map((job) => (
                        <TableRow key={job.id} className="h-12">
                          <TableCell className="max-w-[260px] py-2">
                            <button onClick={() => open(job)} className="min-w-0 text-left">
                              <p className="truncate text-sm font-medium text-foreground hover:underline">
                                {job.title}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {job.location || "Location flexible"}
                              </p>
                            </button>
                          </TableCell>
                          <TableCell className="py-2">
                            <PostingStatusBadge status={job.status} />
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {formatDate(job.publishedAt ?? job.createdAt)}
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">{job.viewCount}</TableCell>
                          <TableCell className="py-2 text-right">
                            <Button size="sm" variant="ghost" onClick={() => open(job)}>
                              <Pencil />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Cards - mobile only */}
                <ul className="mt-3 divide-y divide-border sm:hidden">
                  {visibleJobs.map((job) => (
                    <li key={job.id} className="flex items-center gap-2 py-3">
                      <button onClick={() => open(job)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium text-foreground">{job.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PostingStatusBadge status={job.status} />
                          <span>· {job.viewCount} views</span>
                        </p>
                      </button>
                      <Button size="icon-sm" variant="ghost" onClick={() => open(job)} aria-label="Manage">
                        <Pencil />
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="gap-0 rounded-xl border-border p-3.5 shadow-none">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon ?? <Briefcase className="h-3.5 w-3.5" />}
        <p className="truncate text-[11px] font-medium">{label}</p>
      </div>
      <p className={`mt-2 font-display text-lg font-semibold leading-none ${accent ?? "text-foreground"}`}>
        {value}
      </p>
    </Card>
  );
}

function JobsWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your job postings…</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 rounded-xl border-border p-3.5 shadow-none">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-5 w-10" />
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <Skeleton className="h-8 w-64" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
