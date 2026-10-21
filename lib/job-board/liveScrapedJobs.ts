import { mapScrapedJob } from "@/lib/ingest/scrapedJobs";
import type { PublicJobDetail, PublicJobFilters, PublicJobListItem } from "@/types/jobPosting";

const API_BASE = (process.env.SCRAPER_API_URL || "http://localhost:8000").replace(/\/$/, "");
type RawJob = Record<string, unknown>;
type ApiPage = { data?: RawJob[]; pagination?: { page?: number; limit?: number; total?: number; pages?: number } };

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function mapLiveJob(raw: RawJob): PublicJobDetail | null {
  const result = mapScrapedJob(raw);
  if (!result.ok) return null;
  const p = result.posting;
  const source = raw.source && typeof raw.source === "object" ? raw.source as Record<string, unknown> : {};
  const companySlug = p.companyName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
  return {
    id: `scraper-${p.sourceKey}-${p.sourceJobId}`,
    slug: p.slug,
    title: p.title,
    category: p.category || undefined,
    location: p.location || undefined,
    salaryMin: p.salaryMin ?? undefined,
    salaryMax: p.salaryMax ?? undefined,
    salaryCurrency: p.salaryCurrency || "KES",
    jobType: p.jobType,
    workMode: p.workMode,
    experienceLevel: p.experienceLevel || undefined,
    tags: p.tags,
    publishedAt: p.publishedAt?.toISOString(),
    applicationDeadline: p.applicationDeadline?.toISOString(),
    status: p.inactive ? "closed" : "published",
    isActive: !p.inactive,
    company: {
      id: `scraper-company-${companySlug}`,
      name: p.companyName,
      slug: companySlug,
      location: p.location || undefined,
      website: undefined,
    },
    description: p.description,
    responsibilities: p.responsibilities || undefined,
    requirements: p.requirements || undefined,
    educationLevel: p.educationLevel || undefined,
    certifications: p.certifications || undefined,
    applyMethod: { type: p.applyMethodType, value: p.applyMethodValue },
    applicationInstructions: p.applicationInstructions || undefined,
    applyEmailSubject: p.applyEmailSubject || undefined,
    applyViaAggregator: p.applyViaAggregator,
    descriptionSections: p.descriptionSections || undefined,
    source: {
      name: p.sourceName || asString(source.name) || asString(source.key),
      url: p.sourceUrl || asString(source.url),
    },
  };
}

async function fetchPage(page: number, filters: Pick<PublicJobFilters, "q" | "location"> = {}): Promise<ApiPage> {
  const url = new URL(`${API_BASE}/api/v1/jobs`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "100");
  if (filters.q?.trim()) url.searchParams.set("search", filters.q.trim());
  if (filters.location?.trim()) url.searchParams.set("location", filters.location.trim());
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Scraper API returned HTTP ${response.status}`);
  return await response.json() as ApiPage;
}

/** Fetches scraper records live. This function never writes external jobs to JobTracker's database. */
export async function fetchLiveScrapedJobs(filters: PublicJobFilters = {}): Promise<PublicJobDetail[]> {
  const first = await fetchPage(1, filters);
  const records = Array.isArray(first.data) ? [...first.data] : [];
  const pages = Math.max(1, Math.min(100, Number(first.pagination?.pages) || 1));
  for (let page = 2; page <= pages; page++) {
    const next = await fetchPage(page, filters);
    if (Array.isArray(next.data)) records.push(...next.data);
  }
  const mapped = records.map(mapLiveJob).filter((job): job is PublicJobDetail => !!job && job.isActive !== false);
  const q = filters.q?.trim().toLowerCase();
  const category = filters.category?.trim().toLowerCase();
  const jobType = filters.jobType?.trim().toLowerCase();
  const workMode = filters.workMode?.trim().toLowerCase();
  const experience = filters.experienceLevel?.trim().toLowerCase();
  return mapped.filter((job) => {
    if (q && ![job.title, job.company?.name, job.description, job.category, ...(job.tags || [])].some((v) => String(v || "").toLowerCase().includes(q))) return false;
    if (category && !String(job.category || "").toLowerCase().includes(category)) return false;
    if (jobType && job.jobType !== jobType) return false;
    if (workMode && job.workMode !== workMode) return false;
    if (experience && !String(job.experienceLevel || "").toLowerCase().includes(experience)) return false;
    return true;
  });
}

export function sortAndPageJobs<T extends PublicJobListItem>(jobs: T[], filters: PublicJobFilters) {
  const sorted = [...jobs].sort((a, b) => {
    if (filters.sort === "salary") return (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0);
    return (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0);
  });
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  return {
    jobs: sorted.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total: sorted.length, totalPages: Math.max(1, Math.ceil(sorted.length / limit)) },
  };
}
