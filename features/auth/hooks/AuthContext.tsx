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
import axiosInstance from "@/lib/axiosInstance";
import { tokenStorage } from "@/lib/security/tokenStorage";
import { userStorage } from "@/lib/security/userStorage";
import { roleStorage } from "@/lib/auth/roleStorage";
import { authEvents } from "@/lib/auth/authEvents";
import { adminAuthService } from "@/features/admin/services/adminAuthService";
import type { LoginRequest, User } from "@/types/auth";

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
  /** Persists a freshly-issued session (used by the Google SSO flow after sign-in). */
  setSession: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    tokenStorage.removeToken();
    userStorage.clear();
    roleStorage.clear();
    setUser(null);
  }, []);

  const setSession = useCallback((nextUser: User, token: string) => {
    tokenStorage.setToken(token);
    userStorage.set(nextUser);
    setUser(nextUser);
  }, []);

  // On mount, silently try to restore the session from the httpOnly refresh
  // cookie. This is the only trustworthy signal that a session still
  // exists — the cached user below is just for an instant, optimistic UI.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const cachedUser = userStorage.get();
      if (cachedUser) setUser(cachedUser);

      try {
        const { data } = await axiosInstance.post("/auth/refresh");
        const token = data?.data?.token as string | undefined;
        if (cancelled) return;

        if (token) {
          tokenStorage.setToken(token);
        } else {
          clearSession();
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // The axios interceptor emits this when a request comes back 401 and the
  // refresh attempt itself fails, so the whole app can react consistently.
  useEffect(() => authEvents.onUnauthorized(clearSession), [clearSession]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const credentials: LoginRequest = { email, password };
      const response = await adminAuthService.login(credentials);
      setSession(response.data.user, response.data.token);
      roleStorage.set("admin");
      return response.data.user;
    },
    [setSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      logout,
      loginAdmin,
      setSession,
    }),
    [user, isLoading, logout, loginAdmin, setSession],
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
