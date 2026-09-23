import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { createEmployerCompany, employerCompany, updateEmployerCompany } from "@/lib/jobPostings/queries";

function companyInput(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.name !== "string" || !body.name.trim()) return null;
  return {
    name: body.name.trim(), description: typeof body.description === "string" ? body.description : "",
    website: typeof body.website === "string" ? body.website : "", location: typeof body.location === "string" ? body.location : "",
    industry: typeof body.industry === "string" ? body.industry : "",
  };
}

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const company = await employerCompany(auth.payload.sub);
  return company ? ok(company) : fail("Create your company profile before posting jobs.", 404);
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  if (await employerCompany(auth.payload.sub)) return fail("A company profile already exists.", 409);
  const input = companyInput(await readJson(request));
  if (!input) return fail("Company name is required.", 400);
  return ok(await createEmployerCompany(auth.payload.sub, input), 201);
}

export async function PUT(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const input = companyInput(await readJson(request));
  if (!input) return fail("Company name is required.", 400);
  const company = await updateEmployerCompany(auth.payload.sub, input);
  return company ? ok(company) : fail("Company profile not found.", 404);
}
