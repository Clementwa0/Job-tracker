import { verifyAccessToken, type TokenPayload } from "@/lib/auth/jwt";
import { isUuid } from "@/lib/uuid";

export type AuthorizeResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; status: number; message: string };

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/**
 * Verifies the request's access token and checks its role against
 * `allowedRoles`. Use this at the top of any API route handler that must
 * enforce authorization server-side - never trust a client-supplied role.
 */
export function requireRole(
  request: Request,
  allowedRoles: TokenPayload["role"][],
): AuthorizeResult {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Authentication required." };
  }

  let payload: TokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return { ok: false, status: 401, message: "Invalid or expired session." };
  }

  // Ids are UUIDs now. A validly signed token whose `sub` isn't one was
  // issued before the PostgreSQL migration (a MongoDB ObjectId) - treat it
  // as expired so the client re-authenticates, instead of letting it reach
  // a uuid column and blow up.
  if (!isUuid(payload.sub)) {
    return { ok: false, status: 401, message: "Invalid or expired session." };
  }

  if (!allowedRoles.includes(payload.role)) {
    return { ok: false, status: 403, message: "You don't have access to this resource." };
  }

  return { ok: true, payload };
}
