import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, users } from "@/lib/db/schema";
import { requireRole, type AuthorizeResult } from "@/lib/auth/requireRole";
import { toAppRole } from "@/lib/auth/roles";
import type { TokenPayload } from "@/lib/auth/jwt";

/**
 * `requireRole` plus a database check: the account behind a valid access
 * token must still exist, still hold the role the token claims, and not be
 * suspended. A signed token alone stays valid for its whole lifetime, so
 * without this a suspended or deleted account could keep using the API until
 * the token expired.
 *
 * One primary-key lookup per request. Use this at the top of every handler
 * that reads or writes user-owned data.
 */
export async function requireActiveAccount(
  request: Request,
  allowedRoles: TokenPayload["role"][],
): Promise<AuthorizeResult> {
  const base = requireRole(request, allowedRoles);
  if (!base.ok) return base;

  const { sub, role } = base.payload;

  try {
    if (role === "admin") {
      const [admin] = await db
        .select({ status: adminUsers.accountStatus })
        .from(adminUsers)
        .where(eq(adminUsers.id, sub))
        .limit(1);
      if (!admin) return { ok: false, status: 401, message: "Invalid or expired session." };
      if (admin.status !== "active") {
        return { ok: false, status: 403, message: "This account has been suspended." };
      }
      return base;
    }

    const [user] = await db
      .select({ role: users.role, status: users.accountStatus })
      .from(users)
      .where(eq(users.id, sub))
      .limit(1);

    // Deleted account, or a token whose role no longer matches the account.
    if (!user || toAppRole(user.role) !== role) {
      return { ok: false, status: 401, message: "Invalid or expired session." };
    }
    if (user.status !== "active") {
      return { ok: false, status: 403, message: "This account has been suspended." };
    }
    return base;
  } catch (error) {
    console.error("Account check failed:", error);
    return { ok: false, status: 500, message: "Couldn't verify your account. Please try again." };
  }
}
