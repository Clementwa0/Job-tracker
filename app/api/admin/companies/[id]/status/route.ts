import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isCompanyStatus, setCompanyStatus } from "@/lib/admin/queries";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

/** PATCH /api/admin/companies/:id/status - body: `{ status: "pending" | "approved" | "suspended" }` */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Company not found.", 404);

  const body = await readJson(request);
  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : undefined;
  if (typeof status !== "string" || !isCompanyStatus(status)) {
    return fail('"status" must be pending, approved or suspended.', 400);
  }

  try {
    const company = await setCompanyStatus(id, status, auth.payload.sub);
    if (!company) return fail("Company not found.", 404);
    return ok(company);
  } catch (error) {
    console.error("Failed to update company status:", error);
    return fail("Failed to update this company.", 500);
  }
}
