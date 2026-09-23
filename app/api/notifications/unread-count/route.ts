import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { unreadCount } from "@/lib/notifications/queries";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok({ unreadCount: await unreadCount(auth.payload.sub) });
  } catch (error) {
    console.error("Failed to count notifications:", error);
    return fail("Failed to load your notifications.", 500);
  }
}
