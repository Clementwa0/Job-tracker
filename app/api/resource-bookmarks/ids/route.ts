import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { listBookmarkedResourceIds } from "@/lib/resources/bookmarks";

export const runtime = "nodejs";

/** GET /api/resource-bookmarks/ids - ids of the caller's saved resources (to mark cards). */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok(await listBookmarkedResourceIds(auth.payload.sub));
  } catch (error) {
    console.error("Failed to list bookmark ids:", error);
    return fail("Failed to load saved resources.", 500);
  }
}
