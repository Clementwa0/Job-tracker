import { fail } from "@/lib/api/http";
import { publicPostingBySlug } from "@/lib/jobPostings/queries";
import { fetchLiveScrapedJobs } from "@/lib/job-board/liveScrapedJobs";

export const dynamic = "force-dynamic";
export const revalidate = 0;
type Context = { params: Promise<{ slug: string }> };

export async function GET(_: Request, { params }: Context) {
  const { slug } = await params;
  try {
    const local = await publicPostingBySlug(slug);
    if (local) return Response.json({ success: true, data: local }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Local employer job lookup failed:", error instanceof Error ? error.message : error);
  }
  try {
    // The source API's detail route is numeric-ID based; resolve the public slug
    // from its live paginated feed without persisting the record locally.
    const external = await fetchLiveScrapedJobs({ limit: 100 });
    const job = external.find((item) => item.slug === slug);
    return job ? Response.json({ success: true, data: job }, { headers: { "Cache-Control": "no-store, max-age=0" } }) : fail("Job posting not found.", 404);
  } catch (error) {
    console.error("Live scraper detail lookup failed:", error instanceof Error ? error.message : error);
    return fail("Job posting not found.", 404);
  }
}
