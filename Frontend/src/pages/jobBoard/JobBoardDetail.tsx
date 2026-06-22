import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookmarkPlus,
  Briefcase,
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageMeta } from "@/components/seo/PageMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CompanyLogo from "@/components/pages/Jobs/CompanyLogo";
import { useAuth } from "@/hooks/AuthContext";
import { useAddPostingToTracker } from "@/hooks/useAddPostingToTracker";
import { executeApply, getApplyMethodLabel } from "@/lib/jobBoard/applyActions";
import { buildJobPostingJsonLd } from "@/lib/seo/jobPostingJsonLd";
import {
  formatJobType,
  formatSalaryRange,
  formatWorkMode,
} from "@/lib/seo/formatSalary";
import { publicJobService } from "@/services/publicJobService";
import { jobService } from "@/services/jobService";
import type { PublicJobDetail } from "@/types/jobPosting";
import { getApiErrorMessage } from "@/lib/apiError";

function ApplyMethodIcon({ type }: { type: PublicJobDetail["applyMethod"]["type"] }) {
  if (type === "email") return <Mail className="h-4 w-4" />;
  if (type === "whatsapp") return <MessageCircle className="h-4 w-4" />;
  return <ExternalLink className="h-4 w-4" />;
}

export default function JobBoardDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToTracker, isAdding } = useAddPostingToTracker();

  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackerJobId, setTrackerJobId] = useState<string | null>(null);
  const [checkingTracker, setCheckingTracker] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await publicJobService.getBySlug(slug);
        if (!cancelled) setJob(data ?? null);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || !job?.id) {
      setTrackerJobId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setCheckingTracker(true);
        const { jobs } = await jobService.getJobsPaginated({ jobPostingId: job.id, limit: 1 });
        if (!cancelled && jobs[0]) setTrackerJobId(jobs[0].id);
      } catch {
        if (!cancelled) setTrackerJobId(null);
      } finally {
        if (!cancelled) setCheckingTracker(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, job?.id]);

  const handleApply = () => {
    if (!job?.applyMethod) return;
    executeApply(job.applyMethod, job.title);
  };

  const handleAddToTracker = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.slug}`)}`);
      return;
    }
    try {
      const created = await addToTracker(job);
      setTrackerJobId(created.id);
      toast.success("Added to your tracker", {
        description: "You can manage this application in My Applications.",
      });
    } catch (err) {
      toast.error("Could not add to tracker", { description: getApiErrorMessage(err) });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center sm:px-6">
        <PageMeta title="Job not found" description="This job posting could not be found." noIndex />
        <h1 className="text-2xl font-bold">Job not found</h1>
        <p className="mt-2 text-muted-foreground">{error || "This listing may have been removed."}</p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const isActive = job.isActive !== false;
  const deadlineLabel = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const metaDescription =
    job.description.length > 155
      ? `${job.description.slice(0, 152)}…`
      : job.description;
  const applyLabel = getApplyMethodLabel(job.applyMethod.type);

  return (
    <>
      <PageMeta
        title={`${job.title} at ${job.company?.name || "Company"}${!isActive ? " (Closed)" : ""}`}
        description={metaDescription}
        path={`/jobs/${job.slug}`}
        type="article"
        noIndex={!isActive}
        jsonLd={isActive ? buildJobPostingJsonLd(job) : undefined}
      />

      {!isActive && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-900 dark:text-amber-100">
          This position is no longer accepting applications.
          {job.status === "closed" && job.closedAt && (
            <span className="ml-1 text-muted-foreground">
              Closed {new Date(job.closedAt).toLocaleDateString()}
            </span>
          )}
          {job.status !== "closed" && job.applicationDeadline && (
            <span className="ml-1 text-muted-foreground">
              Deadline was {deadlineLabel}
            </span>
          )}
        </div>
      )}

      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/jobs">
              <ArrowLeft className="mr-1 h-4 w-4" />
              All jobs
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <CompanyLogo
                name={job.company?.name || "Company"}
                logo={job.company?.logo}
                size="lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-lg text-muted-foreground">{job.company?.name}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {formatJobType(job.jobType)} · {formatWorkMode(job.workMode)}
                  </span>
                  {salary && <span className="font-medium text-foreground">{salary}</span>}
                  {deadlineLabel && isActive && (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      Apply by {deadlineLabel}
                    </span>
                  )}
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ApplyMethodIcon type={job.applyMethod.type} />
                  {applyLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:min-w-[200px]">
              <Button size="lg" className="shrink-0 gap-2" onClick={handleApply} disabled={!isActive}>
                <ApplyMethodIcon type={job.applyMethod.type} />
                {isActive ? "Apply now" : "Applications closed"}
              </Button>
              {trackerJobId ? (
                <Button asChild size="lg" variant="outline" className="shrink-0">
                  <Link to={`/applications/edit/${trackerJobId}`}>View in tracker</Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="shrink-0 gap-2"
                  onClick={handleAddToTracker}
                  disabled={isAdding || checkingTracker}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                  Add to tracker
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold">About the role</h2>
            <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </section>

          {job.requirements && (
            <section>
              <h2 className="text-lg font-semibold">Requirements</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.requirements}
              </p>
            </section>
          )}

          {job.tags.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">How to apply</h3>
            <p className="mt-2 text-sm text-muted-foreground">{applyLabel}</p>
            <p className="mt-1 break-all text-sm font-medium text-foreground">
              {job.applyMethod.value}
            </p>
            <Button className="mt-4 w-full gap-2" onClick={handleApply} disabled={!isActive}>
              <ApplyMethodIcon type={job.applyMethod.type} />
              {isActive ? "Apply now" : "Applications closed"}
            </Button>
            {!trackerJobId && (
              <Button
                variant="outline"
                className="mt-2 w-full gap-2"
                onClick={handleAddToTracker}
                disabled={isAdding || checkingTracker}
              >
                <BookmarkPlus className="h-4 w-4" />
                Add to tracker
              </Button>
            )}
          </div>

          {job.company && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4" />
                About {job.company.name}
              </div>
              {job.company.description && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {job.company.description}
                </p>
              )}
              <dl className="mt-4 space-y-2 text-sm">
                {job.company.industry && (
                  <div>
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="font-medium">{job.company.industry}</dd>
                  </div>
                )}
                {job.company.location && (
                  <div>
                    <dt className="text-muted-foreground">Headquarters</dt>
                    <dd className="font-medium">{job.company.location}</dd>
                  </div>
                )}
              </dl>
              {job.company.website && (
                <>
                  <Separator className="my-4" />
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Visit website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground space-y-1">
            <p>
              Posted{" "}
              {job.publishedAt
                ? new Date(job.publishedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "recently"}
            </p>
            {deadlineLabel && (
              <p>
                Application deadline:{" "}
                <span className="font-medium text-foreground">{deadlineLabel}</span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
