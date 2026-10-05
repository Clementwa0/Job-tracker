"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/lib/auth/authService";
import { authEvents } from "@/lib/auth/authEvents";
import {
  clearAccessToken,
  purgeLegacyAuthStorage,
  setAccessToken,
} from "@/lib/auth/session";
import type { User } from "@/types/auth";

/**
 * The single client-side source of truth for authentication. Everything in the
 * UI reads the session through `useAuth()`; nothing is persisted in browser
 * storage (see lib/auth/session.ts for the token strategy).
 */
interface AuthContextValue {
  /** The signed-in user, or null. Populated for all three roles (user, employer, admin). */
  user: User | null;
  isAuthenticated: boolean;
  /** True until the initial session-restore check has finished. */
  isLoading: boolean;
  /** Clears the session (server + client) for whichever role is currently signed in. */
  logout: () => Promise<void>;
  /** Admin-only email/password login. Never usable for jobseeker/employer accounts. */
  loginAdmin: (email: string, password: string) => Promise<User>;
  /** Google SSO login for jobseekers ("user") and employers. Resolves with the signed-in user. */
  loginWithGoogle: (idToken: string, role: "user" | "employer") => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const startSession = useCallback((nextUser: User, token: string) => {
    setAccessToken(token);
    setUser(nextUser);
  }, []);

  // On mount, restore the session from the httpOnly refresh cookie. The server
  // is the only source of truth: a valid cookie yields a fresh access token and
  // the current user; anything else means signed out.
  useEffect(() => {
    let cancelled = false;
    purgeLegacyAuthStorage();

    async function restoreSession() {
      try {
        const { user: restored } = await authService.refresh();
        if (cancelled) return;
        if (restored) setUser(restored);
        else clearSession();
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // The axios interceptor emits this when a request comes back 401 and the
  // refresh attempt itself fails, so the whole app can react consistently.
  useEffect(() => authEvents.onUnauthorized(clearSession), [clearSession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const response = await authService.adminLogin({ email, password });
      startSession(response.data.user, response.data.token);
      return response.data.user;
    },
    [startSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string, role: "user" | "employer") => {
      const response = await authService.googleSignIn(idToken, role);
      startSession(response.data.user, response.data.token);
      return response.data.user;
    },
    [startSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      logout,
      loginAdmin,
      loginWithGoogle,
    }),
    [user, isLoading, logout, loginAdmin, loginWithGoogle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
