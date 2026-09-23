import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { deleteEmployerPosting, getEmployerPosting, updateEmployerPosting } from "@/lib/jobPostings/queries";
import type { EmployerJobPayload } from "@/types/employer";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) { const auth = await requireActiveAccount(request, ["employer"]); if (!auth.ok) return fail(auth.message, auth.status); const job = await getEmployerPosting(auth.payload.sub, (await params).id); return job ? ok(job) : fail("Job posting not found.", 404); }
export async function PUT(request: Request, { params }: Context) { const auth = await requireActiveAccount(request, ["employer"]); if (!auth.ok) return fail(auth.message, auth.status); const body = await readJson(request) as Partial<EmployerJobPayload>; const job = await updateEmployerPosting(auth.payload.sub, (await params).id, body); return job ? ok(job) : fail("Job posting not found.", 404); }
export async function DELETE(request: Request, { params }: Context) { const auth = await requireActiveAccount(request, ["employer"]); if (!auth.ok) return fail(auth.message, auth.status); const removed = await deleteEmployerPosting(auth.payload.sub, (await params).id); return removed ? ok({ removed: true }) : fail("Only your draft postings can be deleted.", 409); }
