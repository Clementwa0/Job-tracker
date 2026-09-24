import type { User } from "@/types/auth";

const USER_KEY = "jtrail_user";

/**
 * Caches the current user object client-side so the UI can render
 * immediately on load, before the silent refresh call confirms the
 * session is still valid. Never treat this as a source of truth for
 * authorization - the server always re-verifies via the refresh cookie
 * and access token.
 */
export const userStorage = {
  get(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  set(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(USER_KEY);
  },
};
