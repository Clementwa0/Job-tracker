import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { employerCompany, employerDashboardStats, listEmployerPostings } from "@/lib/jobPostings/queries";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  try {
    const userId = auth.payload.sub;
    const [company, { stats, topPostings }, recent] = await Promise.all([
      employerCompany(userId),
      employerDashboardStats(userId),
      listEmployerPostings(userId, { limit: 5 }),
    ]);
    return ok({ hasCompany: !!company, company: company ?? undefined, stats, topPostings, recentPostings: recent.jobs });
  } catch (error) {
    console.error("Failed to load employer dashboard:", error);
    return fail("We couldn't load your dashboard. Please try again.", 500);
  }
}
