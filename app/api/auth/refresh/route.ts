import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, sessions, users } from "@/lib/db/schema";
import { getRefreshCookie, setRefreshCookie, clearRefreshCookie } from "@/lib/auth/cookies";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  type TokenPayload,
} from "@/lib/auth/jwt";
import { sha256 } from "@/lib/auth/hash";
import { toAppRole } from "@/lib/auth/roles";
import { isUuid } from "@/lib/uuid";

export async function POST() {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) {
    return NextResponse.json({ success: true, data: { token: null } });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Tokens issued before the PostgreSQL migration carry a MongoDB
    // ObjectId as `sub`; they can't match any session, so reject them.
    if (!isUuid(payload.sub)) {
      throw new Error("Refresh token predates the PostgreSQL migration");
    }

    const isAdmin = payload.role === "admin";

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          isAdmin ? eq(sessions.adminId, payload.sub) : eq(sessions.userId, payload.sub),
          eq(sessions.refreshTokenHash, sha256(refreshToken)),
        ),
      )
      .limit(1);

    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await db.delete(sessions).where(eq(sessions.id, session.id));
      await clearRefreshCookie();
      return NextResponse.json({ success: false, message: "Session expired." }, { status: 401 });
    }

    let subject: { id: string; role: TokenPayload["role"]; suspended: boolean } | null;
    if (isAdmin) {
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, payload.sub))
        .limit(1);
      subject = admin
        ? { id: admin.id, role: "admin", suspended: admin.accountStatus === "suspended" }
        : null;
    } else {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);
      subject = user
        ? { id: user.id, role: toAppRole(user.role), suspended: user.accountStatus === "suspended" }
        : null;
    }

    if (!subject || subject.suspended) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      await clearRefreshCookie();
      return NextResponse.json({ success: false, message: "Account unavailable." }, { status: 401 });
    }

    const newPayload: TokenPayload = { sub: subject.id, role: subject.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await db
      .update(sessions)
      .set({
        refreshTokenHash: sha256(newRefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      })
      .where(eq(sessions.id, session.id));

    await setRefreshCookie(newRefreshToken);

    return NextResponse.json({ success: true, data: { token: newAccessToken } });
  } catch {
    await clearRefreshCookie();
    return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
  }
}
