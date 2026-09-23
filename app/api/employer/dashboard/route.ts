import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { employerCompany, listEmployerPostings } from "@/lib/jobPostings/queries";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const [company, jobs] = await Promise.all([employerCompany(auth.payload.sub), listEmployerPostings(auth.payload.sub)]);
  const stats = jobs.reduce((result, job) => ({ ...result, totalJobs: result.totalJobs + 1, totalViews: result.totalViews + job.viewCount,
    published: result.published + Number(job.status === "published"), drafts: result.drafts + Number(job.status === "draft"),
    pendingReview: result.pendingReview + Number(job.status === "pending_review"), closed: result.closed + Number(job.status === "closed") }),
    { totalJobs: 0, published: 0, drafts: 0, pendingReview: 0, closed: 0, totalViews: 0 });
  return ok({ hasCompany: !!company, company: company ?? undefined, stats, recentPostings: jobs.slice(0, 5) });
}
