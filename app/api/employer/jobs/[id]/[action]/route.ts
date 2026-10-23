import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isEmployerPostingAction } from "@/lib/jobPostings/lifecycle";
import { transitionEmployerPosting } from "@/lib/jobPostings/queries";
import { isUuid } from "@/lib/uuid";

type Context = { params: Promise<{ id: string; action: string }> };

/** PATCH /api/employer/jobs/:id/(publish|unpublish|close) */
export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);
  const { id, action } = await params;
  if (!isEmployerPostingAction(action)) return fail("Unknown posting action.", 404);
  if (!isUuid(id)) return fail("Job posting not found.", 404);
  try {
    const result = await transitionEmployerPosting(auth.payload.sub, id, action);
    if (result.ok) return ok(result.posting);
    switch (result.reason) {
      case "not_found":
        return fail("Job posting not found.", 404);
      case "invalid_state":
        return fail(result.message, 409);
      case "company_suspended":
        return fail(result.message, 403);
      case "not_ready":
        return fail(`This posting isn't ready to publish. ${result.message}`, 422);
    }
  } catch (error) {
    console.error(`Failed to ${action} posting:`, error);
    return fail("We couldn't update this posting. Please try again.", 500);
  }
}
