import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { applyJobAction, isJobAction } from "@/lib/admin/queries";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string; action: string }> };

/**
 * PATCH /api/admin/jobs/:id/(approve|reject|close|reopen)
 * Body (reject only, optional): `{ reason?: string }`
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id, action } = await params;
  if (!isJobAction(action)) return fail("Unknown action.", 404);
  if (!isUuid(id)) return fail("Job posting not found.", 404);

  let reason: string | undefined;
  if (action === "reject") {
    const body = await readJson(request);
    const raw = body && typeof body === "object" ? (body as { reason?: unknown }).reason : undefined;
    if (raw !== undefined && typeof raw !== "string") return fail('"reason" must be text.', 400);
    reason = raw?.trim().slice(0, 500) || undefined;
  }

  try {
    const result = await applyJobAction(id, action, auth.payload.sub, reason);
    if (result.ok) return ok(result.job);
    if (result.reason === "not_found") return fail("Job posting not found.", 404);
    return fail(
      `This posting is now ${result.currentStatus.replace("_", " ")}, so that action no longer applies. Refresh and try again.`,
      409,
    );
  } catch (error) {
    console.error(`Failed to ${action} job posting:`, error);
    return fail("Failed to update this job posting.", 500);
  }
}
