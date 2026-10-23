import { NextResponse } from "next/server";

import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { RESOURCE_STATUSES, type ResourceStatus } from "@/lib/resources/constants";
import { fileRefErrors, validationFail } from "@/lib/resources/api";
import { createResource, listAdminResources } from "@/lib/resources/queries";
import { resourceInputSchema } from "@/lib/resources/schema";
import { parseListParams } from "@/lib/resources/shared";

export const runtime = "nodejs";

/** GET /api/admin/resources?q=&status=&category=<id>&page=&limit= */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  if (status && !(RESOURCE_STATUSES as readonly string[]).includes(status)) {
    return fail("Invalid status filter.", 400);
  }
  const category = params.get("category");
  if (category && !isUuid(category)) return fail("Invalid category filter.", 400);

  try {
    const result = await listAdminResources({
      q: params.get("q")?.trim().slice(0, 100) || undefined,
      status: (status as ResourceStatus | null) ?? undefined,
      categoryId: category ?? undefined,
      ...parseListParams(params, 20, 100),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list resources:", error);
    return fail("Failed to load resources.", 500);
  }
}

/** POST /api/admin/resources - create a draft or published resource. */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const parsed = resourceInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const refErrors = fileRefErrors(parsed.data);
  if (refErrors) return validationFail(refErrors);

  try {
    const result = await createResource(parsed.data, auth.payload.sub);
    if (result.ok) return ok(result.resource, 201);
    if (result.reason === "category_not_found") return validationFail({ categoryId: "That category no longer exists." });
    if (result.reason === "cannot_publish") return validationFail(result.issues, "This resource isn't ready to publish.");
    return fail("Couldn't save the resource.", 500);
  } catch (error) {
    console.error("Failed to create resource:", error);
    return fail("Failed to create the resource.", 500);
  }
}
