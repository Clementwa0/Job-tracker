import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  candidateProfiles,
  employerProfiles,
  sessions,
  userAccounts,
  users,
} from "@/lib/db/schema";
import { verifyGoogleIdToken } from "@/lib/auth/googleVerify";
import {
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  type TokenPayload,
} from "@/lib/auth/jwt";
import { sha256 } from "@/lib/auth/hash";
import { toAppRole, toDbRole, type DbUserRole } from "@/lib/auth/roles";
import { fromUserRow, type SerializableUser } from "@/lib/auth/serializeUser";

export type AccountRole = "user" | "employer";

export type GoogleAuthResult =
  | { ok: true; user: SerializableUser; accessToken: string; refreshToken: string }
  | { ok: false; status: number; message: string };

const ROLE_LABEL: Record<AccountRole, string> = {
  user: "a job seeker",
  employer: "an employer",
};

const ROLE_LOGIN_PATH: Record<AccountRole, string> = {
  user: "/login",
  employer: "/employer/login",
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Makes sure the per-role profile row exists (one per user) and returns the
 * employer's company id, if any. Safe to call on every sign-in.
 */
async function ensureProfile(
  tx: Tx,
  userId: string,
  role: DbUserRole,
): Promise<string | null> {
  if (role === "jobseeker") {
    await tx
      .insert(candidateProfiles)
      .values({ userId })
      .onConflictDoNothing({ target: candidateProfiles.userId });
    return null;
  }

  await tx
    .insert(employerProfiles)
    .values({ userId })
    .onConflictDoNothing({ target: employerProfiles.userId });

  const [profile] = await tx
    .select({ companyId: employerProfiles.companyId })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, userId))
    .limit(1);

  return profile?.companyId ?? null;
}

/**
 * Verifies a Google ID token and either signs in the matching account or
 * creates a new one, scoped to `role` (jobseeker vs employer). This is the
 * single entry point for account creation in JobTrail — there is no
 * email/password registration path, so signing in with Google the first
 * time *is* how an account gets created.
 *
 * Admin accounts live in a separate table (`admin_users`), so a Google
 * sign-in can never resolve to one.
 */
export async function authenticateWithGoogle(
  idToken: string,
  role: AccountRole,
): Promise<GoogleAuthResult> {
  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch {
    return { ok: false, status: 401, message: "We couldn't verify that Google sign-in. Please try again." };
  }

  if (!profile.emailVerified) {
    return {
      ok: false,
      status: 403,
      message: "Your Google account's email address isn't verified yet.",
    };
  }

  const dbRole = toDbRole(role);

  // Prefer the linked Google identity; fall back to a matching email.
  const [linked] = await db
    .select({ user: users })
    .from(userAccounts)
    .innerJoin(users, eq(userAccounts.userId, users.id))
    .where(
      and(
        eq(userAccounts.provider, "google"),
        eq(userAccounts.providerAccountId, profile.googleId),
      ),
    )
    .limit(1);

  let existing = linked?.user;
  if (!existing) {
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);
    existing = byEmail;
  }

  if (existing) {
    if (existing.role !== dbRole) {
      const existingRole = toAppRole(existing.role);
      return {
        ok: false,
        status: 409,
        message: `This Google account is already registered as ${ROLE_LABEL[existingRole]}. Sign in at ${ROLE_LOGIN_PATH[existingRole]} instead.`,
      };
    }
    if (existing.accountStatus === "suspended") {
      return { ok: false, status: 403, message: "This account has been suspended." };
    }
  }

  const current = existing;

  const { user, employerCompanyId } = await db.transaction(async (tx) => {
    const [row] = current
      ? await tx
          .update(users)
          .set({
            name: current.name || profile.name,
            picture: profile.picture || current.picture,
            emailVerified: true,
            lastLoginAt: new Date(),
          })
          .where(eq(users.id, current.id))
          .returning()
      : await tx
          .insert(users)
          .values({
            name: profile.name,
            email: profile.email,
            picture: profile.picture || null,
            role: dbRole,
            emailVerified: true,
            lastLoginAt: new Date(),
          })
          .returning();

    // Link (or re-link) the Google identity to this user.
    await tx
      .insert(userAccounts)
      .values({
        userId: row.id,
        provider: "google",
        providerAccountId: profile.googleId,
      })
      .onConflictDoUpdate({
        target: [userAccounts.userId, userAccounts.provider],
        set: { providerAccountId: profile.googleId, updatedAt: new Date() },
      });

    const companyId = await ensureProfile(tx, row.id, dbRole);
    return { user: row, employerCompanyId: companyId };
  });

  const tokenPayload: TokenPayload = { sub: user.id, role: toAppRole(user.role) };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await db.insert(sessions).values({
    userId: user.id,
    refreshTokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return {
    ok: true,
    user: fromUserRow(user, employerCompanyId),
    accessToken,
    refreshToken,
  };
}
