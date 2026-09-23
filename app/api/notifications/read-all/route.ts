import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { markAllRead } from "@/lib/notifications/queries";

export async function PATCH(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok({ modified: await markAllRead(auth.payload.sub) });
  } catch (error) {
    console.error("Failed to mark notifications read:", error);
    return fail("Failed to update your notifications.", 500);
  }
}
