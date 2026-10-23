import { fail, ok, readJson } from "@/lib/api/http";
import { parseIdList } from "@/lib/api/ids";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { reorderCategories } from "@/lib/resources/categories";

export const runtime = "nodejs";

/** POST /api/admin/resource-categories/reorder - body `{ ids: [...] }` in the new display order. */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const body = await readJson(request);
  const parsed = parseIdList(body && typeof body === "object" ? (body as { ids?: unknown }).ids : undefined);
  if ("error" in parsed) return fail(parsed.error, 400);

  try {
    const result = await reorderCategories(parsed.ids, auth.payload.sub);
    if (!result.ok) return fail("The category list changed. Refresh and try again.", 409);
    return ok({ ids: parsed.ids });
  } catch (error) {
    console.error("Failed to reorder resource categories:", error);
    return fail("Failed to save the new order.", 500);
  }
}
