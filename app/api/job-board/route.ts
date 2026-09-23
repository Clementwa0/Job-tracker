import { ok } from "@/lib/api/http";
import { publicPostings } from "@/lib/jobPostings/queries";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const { jobs, meta } = await publicPostings({ q: p.get("q") || undefined, location: p.get("location") || undefined,
    category: p.get("category") || undefined, jobType: p.get("jobType") || undefined, workMode: p.get("workMode") || undefined,
    experienceLevel: p.get("experienceLevel") || undefined,
    sort: p.get("sort") === "salary" ? "salary" : "newest", page: Number(p.get("page")) || 1, limit: Number(p.get("limit")) || 20 });
  return Response.json({ success: true, data: jobs, meta });
}
