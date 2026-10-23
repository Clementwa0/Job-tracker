import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { createEmployerPosting, listEmployerPostings } from "@/lib/jobPostings/queries";
import { parseNewPosting } from "@/lib/jobPostings/validation";

function intParam(value: string | null) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

/** GET /api/employer/jobs?status=&q=&page=&limit= - paginated on the server. */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const params = new URL(request.url).searchParams;
  try {
    const { jobs, meta, counts, totalViews } = await listEmployerPostings(auth.payload.sub, {
      status: params.get("status") || undefined,
      q: params.get("q") || undefined,
      page: intParam(params.get("page")),
      limit: intParam(params.get("limit")),
    });
    return Response.json({ success: true, data: jobs, meta, counts, totalViews });
  } catch (error) {
    console.error("Failed to list employer postings:", error);
    return fail("We couldn't load your job postings. Please try again.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const parsed = parseNewPosting(await readJson(request));
  if (!parsed.ok) return fail(parsed.message, 400);
  try {
    const job = await createEmployerPosting(auth.payload.sub, parsed.value);
    return job ? ok(job, 201) : fail("Create a company profile before posting jobs.", 409);
  } catch (error) {
    console.error("Failed to create posting:", error);
    return fail("We couldn't save this posting. Please try again.", 500);
  }
}
