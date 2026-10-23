/**
 * One definition of every job-search metric the jobseeker UI shows, so the
 * dashboard, analytics and summary cards can never disagree about a number.
 *
 * These mirror what the API computes in `lib/jobs/stats.ts`:
 *  - "responded" and "offered" are history, not current state (a job that
 *    reached interviewing/offer still counts after it moves on).
 *  - an "active" interview is one that is still ahead of the user
 *    (scheduled or rescheduled); completed/passed/failed/canceled are not.
 *
 * Pure and dependency-free so it can run on either side.
 */
import { RESPONSE_STATUSES, normalizeStatus } from "@/lib/jobs/status";

export const ACTIVE_INTERVIEW_STATUSES = ["scheduled", "rescheduled"] as const;

export interface MetricJob {
  applicationStatus?: string | null;
  respondedAt?: string | null;
  offerAt?: string | null;
}

export interface MetricInterview {
  status?: string | null;
  jobId?: string | { _id: string } | null;
}

export function hasResponded(job: MetricJob): boolean {
  return (
    !!job.respondedAt ||
    (RESPONSE_STATUSES as readonly string[]).includes(normalizeStatus(job.applicationStatus))
  );
}

export function hasOffer(job: MetricJob): boolean {
  return !!job.offerAt || normalizeStatus(job.applicationStatus) === "offer";
}

export function isActiveInterview(interview: MetricInterview): boolean {
  return (ACTIVE_INTERVIEW_STATUSES as readonly string[]).includes(interview.status ?? "");
}

function interviewJobId(interview: MetricInterview): string | null {
  const { jobId } = interview;
  if (!jobId) return null;
  return typeof jobId === "string" ? jobId : jobId._id;
}

export interface JobMetrics {
  total: number;
  /** Count per normalized status; every status that occurs is present. */
  statusCounts: Record<string, number>;
  responded: number;
  /** % of applications an employer replied to, one decimal. */
  responseRate: number;
  /** Applications that ever reached an interview (an interview on file, or interviewing/offer). */
  interviewed: number;
  /** % of applications that reached an interview, one decimal. */
  interviewRate: number;
  offers: number;
  rejected: number;
  /** Interviews still ahead (scheduled / rescheduled). */
  upcomingInterviews: number;
}

const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

export function computeJobMetrics(
  jobs: (MetricJob & { id: string })[],
  interviews: MetricInterview[] = [],
): JobMetrics {
  const statusCounts: Record<string, number> = {};
  let responded = 0;
  let offers = 0;

  const withInterview = new Set<string>();
  for (const iv of interviews) {
    if (iv.status === "canceled") continue;
    const id = interviewJobId(iv);
    if (id) withInterview.add(id);
  }

  let interviewed = 0;
  for (const job of jobs) {
    const status = normalizeStatus(job.applicationStatus) || "unknown";
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    if (hasResponded(job)) responded += 1;
    if (hasOffer(job)) offers += 1;
    if (withInterview.has(job.id) || status === "interviewing" || hasOffer(job)) interviewed += 1;
  }

  return {
    total: jobs.length,
    statusCounts,
    responded,
    responseRate: pct(responded, jobs.length),
    interviewed,
    interviewRate: pct(interviewed, jobs.length),
    offers,
    rejected: statusCounts["rejected"] ?? 0,
    upcomingInterviews: interviews.filter(isActiveInterview).length,
  };
}
