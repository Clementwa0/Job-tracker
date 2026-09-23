import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, sessions } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  type TokenPayload,
} from "@/lib/auth/jwt";
import { sha256 } from "@/lib/auth/hash";
import { fromAdminRow, type SerializableUser } from "@/lib/auth/serializeUser";
import { isUuid } from "@/lib/uuid";

export type AdminAuthResult =
  | { ok: true; user: SerializableUser; accessToken: string; refreshToken: string }
  | { ok: false; status: number; message: string };

const INVALID_CREDENTIALS_MESSAGE = "Invalid admin credentials.";

/**
 * Verifies admin email/password credentials and issues session tokens.
 * This is the only email/password login path in JobTrail — jobseekers and
 * employers authenticate exclusively via Google SSO, and admins live in
 * their own `admin_users` table.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminAuthResult> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);

  // Same generic message whether the account doesn't exist or the password
  // is wrong, so we don't leak which admin emails exist.
  if (!admin) {
    return { ok: false, status: 401, message: INVALID_CREDENTIALS_MESSAGE };
  }

  if (admin.accountStatus === "suspended") {
    return { ok: false, status: 403, message: "This account has been suspended." };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { ok: false, status: 401, message: INVALID_CREDENTIALS_MESSAGE };
  }

  const [updated] = await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, admin.id))
    .returning();

  const tokenPayload: TokenPayload = { sub: admin.id, role: "admin" };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await db.insert(sessions).values({
    adminId: admin.id,
    refreshTokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { ok: true, user: fromAdminRow(updated ?? admin), accessToken, refreshToken };
}

/** Changes an admin's password after verifying their current one. */
export async function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!isUuid(userId)) {
    return { ok: false, status: 404, message: "Admin account not found." };
  }

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);

  if (!admin) {
    return { ok: false, status: 404, message: "Admin account not found." };
  }

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    return { ok: false, status: 401, message: "Current password is incorrect." };
  }

  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(adminUsers.id, admin.id));

  return { ok: true };
}
