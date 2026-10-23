import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { removeBookmark } from "@/lib/resources/bookmarks";

export const runtime = "nodejs";

/** DELETE /api/resource-bookmarks/:resourceId - removes the caller's own bookmark only. */
export async function DELETE(request: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { resourceId } = await params;
  if (!isUuid(resourceId)) return fail("Resource not found.", 404);

  try {
    await removeBookmark(auth.payload.sub, resourceId);
    return ok({ resourceId });
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
    return fail("Failed to remove this bookmark.", 500);
  }
}
