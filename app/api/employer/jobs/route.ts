import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { createEmployerPosting, listEmployerPostings } from "@/lib/jobPostings/queries";
import type { EmployerJobPayload } from "@/types/employer";

function validPayload(value: unknown): value is EmployerJobPayload {
  const body = value as Partial<EmployerJobPayload> | null;
  return !!body && typeof body.companyName === "string" && !!body.companyName.trim() && typeof body.title === "string" && !!body.title.trim() && typeof body.description === "string" && typeof body.location === "string" && !!body.location.trim() && !!body.applyMethod?.value;
}
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const status = new URL(request.url).searchParams.get("status") || undefined;
  const jobs = await listEmployerPostings(auth.payload.sub, status);
  return Response.json({ success: true, data: jobs, meta: { page: 1, limit: jobs.length, total: jobs.length, totalPages: 1 } });
}
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const body = await readJson(request);
  if (!validPayload(body)) return fail("Company name, title, location, description, and an application method are required.", 400);
  const job = await createEmployerPosting(auth.payload.sub, body);
  return job ? ok(job, 201) : fail("Create a company profile before posting jobs.", 409);
}
