import { NextResponse } from "next/server";

import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { addBookmark, listBookmarkedResources } from "@/lib/resources/bookmarks";
import { parseListParams } from "@/lib/resources/shared";

export const runtime = "nodejs";

/** GET /api/resource-bookmarks?page=&limit= - the caller's own saved resources. */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    const { page, limit } = parseListParams(new URL(request.url).searchParams, 12, 50);
    const result = await listBookmarkedResources(auth.payload.sub, page, limit);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list resource bookmarks:", error);
    return fail("Failed to load saved resources.", 500);
  }
}

/** POST /api/resource-bookmarks - body `{ resourceId }`. Idempotent. */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const body = await readJson(request);
  const resourceId = body && typeof body === "object" ? (body as { resourceId?: unknown }).resourceId : undefined;
  if (!isUuid(resourceId)) return fail('"resourceId" must be a valid id.', 400);

  try {
    const result = await addBookmark(auth.payload.sub, resourceId);
    if (!result.ok) return fail("Resource not found.", 404);
    return ok({ resourceId }, 201);
  } catch (error) {
    console.error("Failed to bookmark resource:", error);
    return fail("Failed to save this resource.", 500);
  }
}
