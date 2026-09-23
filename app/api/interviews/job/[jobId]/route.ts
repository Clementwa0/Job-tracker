import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { listInterviews } from "@/lib/interviews/queries";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ jobId: string }> };

/** The caller's interviews for one application (empty if it isn't theirs). */
export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { jobId } = await params;
  if (!isUuid(jobId)) return fail("Application not found.", 404);

  try {
    return ok(await listInterviews(auth.payload.sub, jobId));
  } catch (error) {
    console.error("Failed to list job interviews:", error);
    return fail("Failed to load the interviews for this application.", 500);
  }
}
