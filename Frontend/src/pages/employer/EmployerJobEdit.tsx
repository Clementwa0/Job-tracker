import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobPostingForm, { emptyJobPostingForm } from "@/features/employer/JobPostingForm";
import PostingLifecycleActions from "@/features/employer/PostingLifecycleActions";
import PostingStatusBadge from "@/features/employer/PostingStatusBadge";
import { employerService } from "@/services/employerService";
import type { EmployerJobPayload, EmployerJobPosting } from "@/types/employer";
import { getApiErrorMessage } from "@/lib/apiError";

function postingToForm(posting: EmployerJobPosting): EmployerJobPayload {
  return {
    title: posting.title,
    description: posting.description,
    requirements: posting.requirements || "",
    location: posting.location || "",
    salaryMin: posting.salaryMin ?? null,
    salaryMax: posting.salaryMax ?? null,
    salaryCurrency: posting.salaryCurrency || "USD",
    jobType: posting.jobType,
    workMode: posting.workMode,
    tags: posting.tags || [],
    applyMethod: posting.applyMethod,
    applicationDeadline: posting.applicationDeadline
      ? posting.applicationDeadline.slice(0, 10)
      : null,
  };
}

export default function EmployerJobEdit() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [posting, setPosting] = useState<EmployerJobPosting | null>(null);
  const [form, setForm] = useState<EmployerJobPayload>(emptyJobPostingForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);

  const reload = async () => {
    const job = await employerService.getJob(id);
    setPosting(job);
    setForm(postingToForm(job));
    return job;
  };

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } catch (err) {
        toast.error("Job not found", { description: getApiErrorMessage(err) });
        navigate("/employer/jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const patch = (p: Partial<EmployerJobPayload>) => setForm((prev) => ({ ...prev, ...p }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await employerService.updateJob(id, form);
      setPosting(updated);
      toast.success("Changes saved");
    } catch (err) {
      toast.error("Failed to save", { description: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const runLifecycle = async (action: () => Promise<EmployerJobPosting>, successMsg: string) => {
    try {
      setActing(true);
      const updated = await action();
      setPosting(updated);
      setForm(postingToForm(updated));
      toast.success(successMsg);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActing(true);
      await employerService.updateJob(id, form);
      const updated = await employerService.publishJob(id);
      setPosting(updated);
      setForm(postingToForm(updated));
      toast.success(updated.status === "pending_review" ? "Submitted for review" : "Job is live");
    } catch (err) {
      toast.error("Could not publish", { description: getApiErrorMessage(err) });
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this draft permanently?")) return;
    try {
      setActing(true);
      await employerService.deleteJob(id);
      toast.success("Draft deleted");
      navigate("/employer/jobs");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!posting) return null;

  const isClosed = posting.status === "closed";
  const isPendingReview = posting.status === "pending_review";
  const canEdit = !isClosed && !isPendingReview;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/employer/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to jobs
        </Link>
      </Button>

      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Edit job posting</h1>
            <PostingStatusBadge status={posting.status} />
          </div>
          {(posting.status === "published" || posting.status === "closed") && (
            <a
              href={`/jobs/${posting.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View on job board
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <PostingLifecycleActions
          posting={posting}
          onPublish={handlePublish}
          onUnpublish={() => runLifecycle(() => employerService.unpublishJob(id), "Job unpublished")}
          onClose={() => runLifecycle(() => employerService.closeJob(id), "Job closed")}
          onDelete={handleDelete}
          publishing={acting}
          acting={acting || saving}
        />
      </div>

      {isClosed && (
        <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          This listing is closed and cannot be edited. Use &quot;Reopen &amp; publish&quot; to hire again.
        </p>
      )}

      {isPendingReview && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          This job is awaiting platform review. Unpublish to return it to draft and make edits.
        </p>
      )}

      {canEdit && (
        <JobPostingForm
          value={form}
          onChange={patch}
          onSubmit={handleSave}
          submitLabel={saving ? "Saving…" : "Save changes"}
          isSubmitting={saving}
        />
      )}
    </div>
  );
}
