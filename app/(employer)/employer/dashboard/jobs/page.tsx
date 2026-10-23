"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Plus,
  RotateCw,
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
import { useDebounce } from "@/hooks/useDebounce";
import type { EmployerJobsMeta, EmployerStatusCounts } from "@/types/employer";

type Filter = "all" | PostingStatus;

const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending review" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

const PAGE_SIZE = 10;
const EMPTY_COUNTS: EmployerStatusCounts = { all: 0, draft: 0, pending_review: 0, published: 0, closed: 0 };

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

  // Server-paginated: `jobs` is only the current page. Counts and total views
  // come from the server and cover every posting, whatever the filters.
  const [jobs, setJobs] = useState<EmployerJobPosting[] | null>(null);
  const [meta, setMeta] = useState<EmployerJobsMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [counts, setCounts] = useState<EmployerStatusCounts>(EMPTY_COUNTS);
  const [totalViews, setTotalViews] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [companyProfileExists, setCompanyProfileExists] = useState<boolean | null>(null);
  const debouncedQuery = useDebounce(query.trim(), 300);

  const [editor, setEditor] = useState<EmployerJobPosting | "new" | null>(null);
  const [form, setForm] = useState<EmployerJobPayload>(emptyJobPostingForm);
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const handledDeepLink = useRef<string | null>(null);
  // Ignore responses from superseded requests (fast typing, quick tab changes).
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoadError(null);
    setFetching(true);
    try {
      const [list, company] = await Promise.all([
        employerService.listJobs({
          status: filter === "all" ? undefined : filter,
          q: debouncedQuery || undefined,
          page,
          limit: PAGE_SIZE,
        }),
        employerService.getCompany().then(() => true).catch(() => false),
      ]);
      if (current !== requestId.current) return;
      setJobs(list.jobs);
      setMeta(list.meta);
      setCounts({ ...EMPTY_COUNTS, ...list.counts });
      setTotalViews(list.totalViews);
      setCompanyProfileExists(company);
      // The server clamps out-of-range pages; keep the UI in sync.
      if (list.meta.page !== page) setPage(list.meta.page);
    } catch (err) {
      if (current !== requestId.current) return;
      setLoadError(getApiErrorMessage(err) || "Couldn't load your job postings.");
    } finally {
      if (current === requestId.current) setFetching(false);
    }
  }, [filter, debouncedQuery, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  const changeQuery = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  const clearFilters = () => {
    setFilter("all");
    setQuery("");
    setPage(1);
  };

  const open = useCallback((job: EmployerJobPosting | "new") => {
    setEditor(job);
    setForm(job === "new" ? { ...emptyJobPostingForm, tags: [] } : formToEdit(job));
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  // Deep-linkable: /employer/dashboard/jobs?edit=<id> opens that posting's
  // editor, and ?new=1 opens a fresh draft - used by dashboard shortcuts.
  // The posting may be on another page, so it's fetched by id. Each link is
  // handled once, so reloading the list never re-opens a closed editor.
  useEffect(() => {
    if (jobs === null) return;
    const editId = searchParams.get("edit");
    const key = editId ? `edit:${editId}` : searchParams.get("new") === "1" ? "new" : null;
    if (!key) {
      handledDeepLink.current = null;
      return;
    }
    if (handledDeepLink.current === key) return;
    handledDeepLink.current = key;
    if (!editId) {
      open("new");
      return;
    }
    const match = jobs.find((job) => job.id === editId);
    if (match) {
      open(match);
      return;
    }
    employerService
      .getJob(editId)
      .then(open)
      .catch(() => toast.error("We couldn't find that posting.", { description: "It may have been deleted." }));
  }, [jobs, searchParams, open]);

  const hasActiveFilters = filter !== "all" || query.trim().length > 0;
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.total, meta.page * meta.limit);

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
    if (companyProfileExists === true) return;
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
      if (/create (a|your) company profile/i.test(message)) {
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
    let savedOk = false;
    try {
      await ensureCompanyProfile();
      const saved = editor === "new"
        ? await employerService.createJob(form)
        : editor
          ? await employerService.updateJob(editor.id, form)
          : null;
      const id = saved?.id ?? (editor !== "new" ? editor?.id : undefined);
      // The draft now exists. If publishing is rejected below, keep the editor
      // pointed at it so a retry updates this posting instead of creating a copy.
      savedOk = true;
      if (editor === "new" && saved) setEditor(saved);
      if (id) await employerService.publishJob(id);
      toast.success("Posting published.");
      closeEditor();
      await load();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (/create (a|your) company profile/i.test(message)) {
        toast.error("Create your company profile first.", {
          description: "Job postings must belong to a company.",
          action: { label: "Create profile", onClick: () => router.push("/employer/dashboard/company") },
        });
      } else {
        toast.error(message || "Couldn't publish posting.", {
          description: savedOk ? "Your changes were saved, but the posting isn't live yet." : undefined,
        });
        void load();
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
            <StatChip label="Total views" value={totalViews.toLocaleString()} icon={<Eye className="h-3.5 w-3.5" />} />
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

          <Card className={fetching ? "p-4 opacity-70 transition-opacity" : "p-4"} aria-busy={fetching}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => changeFilter(v as Filter)}>
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
                  onChange={(e) => changeQuery(e.target.value)}
                  placeholder="Search by title or location"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            {loadError ? (
              <div role="alert" className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">We couldn&apos;t load your postings</p>
                <p className="max-w-sm text-xs text-muted-foreground">{loadError}</p>
                <Button variant="outline" size="sm" onClick={() => void load()} disabled={fetching}>
                  <RotateCw />
                  Try again
                </Button>
              </div>
            ) : (jobs ?? []).length === 0 ? (
              hasActiveFilters ? (
                <EmployerJobsEmptyState
                  title="No postings match"
                  description="Try a different tab or search, or clear your filters."
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                />
              ) : companyProfileExists === false ? (
                <EmployerJobsEmptyState
                  icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
                  title="Set up your company profile first"
                  description="Job postings belong to a company. Create your profile, then post your first role."
                  actionLabel="Create company profile"
                  onAction={() => router.push("/employer/dashboard/company")}
                />
              ) : (
                <EmployerJobsEmptyState onPostJob={() => open("new")} />
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
                      {(jobs ?? []).map((job) => (
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
                  {(jobs ?? []).map((job) => (
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
                {/* Pagination - the server returns one page at a time */}
                {meta.totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground" aria-live="polite">
                      Showing {rangeStart}-{rangeEnd} of {meta.total}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={meta.page <= 1 || fetching}
                      >
                        <ChevronLeft />
                        Previous
                      </Button>
                      <span className="px-1 text-xs text-muted-foreground">
                        Page {meta.page} of {meta.totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        disabled={meta.page >= meta.totalPages || fetching}
                      >
                        Next
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
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
  value: number | string;
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
