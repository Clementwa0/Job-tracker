import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { transitionEmployerPosting } from "@/lib/jobPostings/queries";
type Context = { params: Promise<{ id: string; action: string }> };
export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireActiveAccount(request, ["employer"]); if (!auth.ok) return fail(auth.message, auth.status);
  const { id, action } = await params;
  if (action !== "publish" && action !== "unpublish" && action !== "close") return fail("Unknown posting action.", 404);
  const job = await transitionEmployerPosting(auth.payload.sub, id, action);
  return job ? ok(job) : fail("Job posting not found.", 404);
}
