import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail } from "@/lib/api/http";
import { listNotifications } from "@/lib/notifications/queries";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Notifications belong to a user account, so both job seekers and employers can read their own. */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(params.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );

  try {
    const result = await listNotifications(auth.payload.sub, {
      page,
      limit,
      unreadOnly: params.get("unread") === "true",
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list notifications:", error);
    return fail("Failed to load your notifications.", 500);
  }
}
