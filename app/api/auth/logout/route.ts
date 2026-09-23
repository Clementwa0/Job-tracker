import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { getRefreshCookie, clearRefreshCookie } from "@/lib/auth/cookies";
import { sha256 } from "@/lib/auth/hash";

export async function POST() {
  const refreshToken = await getRefreshCookie();

  if (refreshToken) {
    try {
      await db
        .delete(sessions)
        .where(eq(sessions.refreshTokenHash, sha256(refreshToken)));
    } catch (error) {
      console.error("Failed to revoke session on logout:", error);
    }
  }

  await clearRefreshCookie();
  return NextResponse.json({ success: true });
}
