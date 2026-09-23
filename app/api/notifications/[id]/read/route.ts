import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { markRead } from "@/lib/notifications/queries";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user", "employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Notification not found.", 404);

  try {
    const notification = await markRead(auth.payload.sub, id);
    return notification ? ok(notification) : fail("Notification not found.", 404);
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    return fail("Failed to update this notification.", 500);
  }
}
