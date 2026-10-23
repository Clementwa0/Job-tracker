import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { validationFail } from "@/lib/resources/api";
import { applyResourceAction, isResourceAction } from "@/lib/resources/queries";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string; action: string }> };

/** PATCH /api/admin/resources/:id/(publish|unpublish|feature|unfeature) */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id, action } = await params;
  if (!isResourceAction(action)) return fail("Unknown action.", 404);
  if (!isUuid(id)) return fail("Resource not found.", 404);

  try {
    const result = await applyResourceAction(id, action, auth.payload.sub);
    if (result.ok) return ok(result.resource);
    if (result.reason === "not_found") return fail("Resource not found.", 404);
    return validationFail(result.issues, "This resource isn't ready to publish. Open it and complete the missing fields.");
  } catch (error) {
    console.error(`Failed to ${action} resource:`, error);
    return fail("Failed to update this resource.", 500);
  }
}
