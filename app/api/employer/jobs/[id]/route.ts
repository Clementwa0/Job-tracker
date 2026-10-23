import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { deleteEmployerPosting, getEmployerPosting, updateEmployerPosting } from "@/lib/jobPostings/queries";
import { parsePostingUpdate } from "@/lib/jobPostings/validation";
import { isUuid } from "@/lib/uuid";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const { id } = await params;
  if (!isUuid(id)) return fail("Job posting not found.", 404);
  const job = await getEmployerPosting(auth.payload.sub, id);
  return job ? ok(job) : fail("Job posting not found.", 404);
}

export async function PUT(request: Request, { params }: Context) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const { id } = await params;
  if (!isUuid(id)) return fail("Job posting not found.", 404);
  const parsed = parsePostingUpdate(await readJson(request));
  if (!parsed.ok) return fail(parsed.message, 400);
  try {
    const result = await updateEmployerPosting(auth.payload.sub, id, parsed.value);
    if (result.ok) return ok(result.posting);
    if (result.reason === "not_found") return fail("Job posting not found.", 404);
    return fail(result.message, result.reason === "locked" ? 409 : 422);
  } catch (error) {
    console.error("Failed to update posting:", error);
    return fail("We couldn't save your changes. Please try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const { id } = await params;
  if (!isUuid(id)) return fail("Job posting not found.", 404);
  const result = await deleteEmployerPosting(auth.payload.sub, id);
  if (result === "deleted") return ok({ removed: true });
  if (result === "not_found") return fail("Job posting not found.", 404);
  return fail("Only draft postings can be deleted. Close or unpublish this one instead.", 409);
}
