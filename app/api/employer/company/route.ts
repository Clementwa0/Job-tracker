import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { createEmployerCompany, employerCompany, updateEmployerCompany } from "@/lib/jobPostings/queries";
import { parseCompany } from "@/lib/jobPostings/validation";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const company = await employerCompany(auth.payload.sub);
  return company ? ok(company) : fail("Create your company profile before posting jobs.", 404);
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const parsed = parseCompany(await readJson(request));
  if (!parsed.ok) return fail(parsed.message, 400);
  try {
    const result = await createEmployerCompany(auth.payload.sub, parsed.value);
    return result.ok ? ok(result.company, 201) : fail("A company profile already exists.", 409);
  } catch (error) {
    console.error("Failed to create company:", error);
    return fail("We couldn't create your company profile. Please try again.", 500);
  }
}

export async function PUT(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const parsed = parseCompany(await readJson(request));
  if (!parsed.ok) return fail(parsed.message, 400);
  try {
    const company = await updateEmployerCompany(auth.payload.sub, parsed.value);
    return company ? ok(company) : fail("Company profile not found.", 404);
  } catch (error) {
    console.error("Failed to update company:", error);
    return fail("We couldn't save your company profile. Please try again.", 500);
  }
}
