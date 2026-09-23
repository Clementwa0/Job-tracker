import type { TokenPayload } from "@/lib/auth/jwt";

/**
 * The `users.role` enum in Postgres ("jobseeker" | "employer"). Admins are
 * not in that table at all — see `admin_users`.
 */
export type DbUserRole = "jobseeker" | "employer";

/**
 * The role vocabulary used by JWTs, route guards and the frontend
 * ("user" | "employer" | "admin"). Kept as-is so nothing outside the DB
 * layer had to change; these helpers translate at the boundary.
 */
export type AppRole = TokenPayload["role"];

export function toAppRole(role: DbUserRole): "user" | "employer" {
  return role === "jobseeker" ? "user" : "employer";
}

export function toDbRole(role: "user" | "employer"): DbUserRole {
  return role === "user" ? "jobseeker" : "employer";
}
