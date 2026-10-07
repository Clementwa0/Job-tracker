/**
 * Client-side token/session layer - the ONLY place that touches the access token.
 *
 * Token strategy
 * --------------
 * - Refresh token: long-lived, lives exclusively in the httpOnly, sameSite
 *   (secure in production) `jtrail_refresh_token` cookie set by the server
 *   (see lib/auth/cookies.ts). JavaScript can never read it.
 * - Access token: short-lived, held in memory only (a module variable). It is
 *   never written to localStorage/sessionStorage, so it disappears on reload and
 *   is re-issued from the refresh cookie by `refreshSession()` on startup.
 * - No user/role/account data is persisted client-side. The user object comes
 *   from the server (login / refresh responses) and lives in AuthContext state.
 *   Client-side role data is for rendering only; the server re-checks everything
 *   (proxy.ts, requireRole, requireActiveAccount).
 *
 * Only axiosInstance (request/response interceptors) and authService/AuthContext
 * may import from this file. Components must go through `useAuth()`.
 */

import axios from "axios";
import type { User } from "@/types/auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export interface RefreshResult {
  token: string;
  user: User | null;
}

let inFlightRefresh: Promise<RefreshResult> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token (and the current
 * user). Single-flight: the server rotates the refresh token on every call, so
 * concurrent callers (session restore + interceptor retries) must share one
 * request or the later ones would present an already-rotated token.
 *
 * Uses bare axios (not axiosInstance) so a failing refresh can never recurse
 * through the 401 interceptor. Rejects when there is no valid session.
 */
export function refreshSession(): Promise<RefreshResult> {
  inFlightRefresh ??= axios
    .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(({ data }) => {
      const token = data?.data?.token as string | null | undefined;
      if (!token) throw new Error("No active session");
      setAccessToken(token);
      return { token, user: (data?.data?.user as User | undefined) ?? null };
    })
    .catch((error) => {
      clearAccessToken();
      throw error;
    })
    .finally(() => {
      inFlightRefresh = null;
    });
  return inFlightRefresh;
}

/**
 * Removes credentials that older builds kept in localStorage (`token`,
 * `jtrail_user`, `jtrail_last_auth_role`). Called once on startup so a
 * long-lived copy of an old access token or cached user does not linger.
 */
export function purgeLegacyAuthStorage(): void {
  try {
    for (const key of ["token", "jtrail_user", "jtrail_last_auth_role"]) {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable - nothing to purge */
  }
}
