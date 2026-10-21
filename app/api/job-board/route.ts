import { publicPostings } from "@/lib/jobPostings/queries";
import { fetchLiveScrapedJobs, sortAndPageJobs } from "@/lib/job-board/liveScrapedJobs";
import type { PublicJobFilters } from "@/types/jobPosting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const filters: PublicJobFilters = {
    q: p.get("q") || undefined, location: p.get("location") || undefined,
    category: p.get("category") || undefined, jobType: p.get("jobType") || undefined,
    workMode: p.get("workMode") || undefined, experienceLevel: p.get("experienceLevel") || undefined,
    sort: p.get("sort") === "salary" ? "salary" : "newest",
    page: Number(p.get("page")) || 1, limit: Number(p.get("limit")) || 20,
  };

  // Locally-created employer postings remain database-backed. Imported scraper rows
  // are excluded by publicPostings and are fetched live from the source API below.
  const [localResult, externalResult] = await Promise.allSettled([
    publicPostings({ ...filters, page: 1, limit: 5000 }),
    fetchLiveScrapedJobs(filters),
  ]);
  const local = localResult.status === "fulfilled" ? localResult.value : { jobs: [] };
  const external = externalResult.status === "fulfilled" ? externalResult.value : [];
  const sourceUnavailable = externalResult.status === "rejected";
  if (sourceUnavailable) {
    console.error("Live scraper API unavailable:", externalResult.reason instanceof Error ? externalResult.reason.message : externalResult.reason);
  }
  if (localResult.status === "rejected") {
    console.error("Local employer postings unavailable:", localResult.reason instanceof Error ? localResult.reason.message : localResult.reason);
  }

  const combined = [...local.jobs, ...external.map(({ description: _description, responsibilities: _responsibilities, requirements: _requirements, educationLevel: _educationLevel, certifications: _certifications, applyMethod: _applyMethod, applicationInstructions: _instructions, applyEmailSubject: _subject, applyViaAggregator: _aggregator, descriptionSections: _sections, source: _source, ...listItem }) => listItem)];
  const { jobs, meta } = sortAndPageJobs(combined, filters);
  return Response.json({ success: true, data: jobs, meta, sourceUnavailable }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
