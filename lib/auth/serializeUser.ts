import type { AdminUser, User } from "@/lib/db/schema";
import type { User as PublicUser } from "@/types/auth";
import { toAppRole, type AppRole } from "@/lib/auth/roles";

/**
 * Normalised account shape shared by jobseeker/employer users (`users`
 * table) and admins (`admin_users` table), so the auth routes can serialise
 * either the same way.
 */
export interface SerializableUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  accountStatus: "active" | "suspended";
  emailVerified: boolean;
  picture?: string | null;
  employerCompanyId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export function fromUserRow(
  user: User,
  employerCompanyId?: string | null,
): SerializableUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toAppRole(user.role),
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    picture: user.picture,
    employerCompanyId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function fromAdminRow(admin: AdminUser): SerializableUser {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: "admin",
    accountStatus: admin.accountStatus,
    emailVerified: true,
    picture: null,
    employerCompanyId: null,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

export function serializeUser(user: SerializableUser): PublicUser {
  return {
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    employerCompanyId: user.employerCompanyId ?? undefined,
    emailVerified: user.emailVerified,
    picture: user.picture || undefined,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined,
  };
}
