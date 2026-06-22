import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/authService";
import { employerAuthService } from "@/features/employer/services/employerAuthService";
import { adminAuthService } from "@/features/admin/services/adminAuthService";
import type { EmployerRegisterRequest } from "@/features/employer/services/employerAuthService";
import { authEvents } from "@/lib/authEvents";
import { tokenStorage } from "@/lib/tokenStorage";
import { getLoginPathForLocation, isAuthPublicPath } from "@/lib/auth/redirects";
import { roleStorage } from "@/lib/auth/roleStorage";
import type { User as ApiUser } from "@/types/auth";

interface User extends ApiUser {
  avatarUrl?: string;
  jobTitle?: string;
  location?: string;
  phone?: string;
  emailVerified?: boolean;
  role?: "user" | "admin" | "employer";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginEmployer: (email: string, password: string) => Promise<User>;
  loginAdmin: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerEmployer: (data: EmployerRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (current: string, next: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const IDLE_LIMIT_MS = 30 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    tokenStorage.removeToken();
  }, []);

  const applySession = useCallback((accessToken: string, nextUser: User) => {
    tokenStorage.setToken(accessToken);
    setToken(accessToken);
    setUser(nextUser);
    if (nextUser.role) roleStorage.set(nextUser.role);
  }, []);

  const hydrate = useCallback(async (t: string) => {
    setToken(t);
    const res = await authService.getCurrentUser();
    setUser(res.data.user);
    if (res.data.user.role) roleStorage.set(res.data.user.role);
  }, []);

  useEffect(() => {
    const unsub = authEvents.onUnauthorized(() => {
      clearSession();
      const path = window.location.pathname;
      if (!isAuthPublicPath(path)) {
        window.location.href = getLoginPathForLocation(path);
      }
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      const stored = tokenStorage.getToken();
      if (!stored) { setIsLoading(false); return; }
      try { await hydrate(stored); }
      catch { clearSession(); }
      finally { setIsLoading(false); }
    })();
  }, [hydrate, clearSession]);

  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearSession();
        window.location.href = `${getLoginPathForLocation(window.location.pathname)}?reason=idle`;
      }, IDLE_LIMIT_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [token, clearSession]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    applySession(res.data.token, res.data.user);
    return res.data.user;
  };

  const loginEmployer = async (email: string, password: string) => {
    const res = await employerAuthService.login({ email, password });
    applySession(res.data.token, res.data.user);
    return res.data.user;
  };

  const loginAdmin = async (email: string, password: string) => {
    const res = await adminAuthService.login({ email, password });
    applySession(res.data.token, res.data.user);
    return res.data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    applySession(res.data.token, res.data.user);
  };

  const registerEmployer = async (data: EmployerRegisterRequest) => {
    const res = await employerAuthService.register(data);
    applySession(res.data.token, res.data.user);
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    roleStorage.clear();
    clearSession();
  };

  const refresh = async () => {
    const stored = tokenStorage.getToken();
    if (stored) await hydrate(stored);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authService.updateProfile(data);
    setUser(res.data.user);
  };
  const updatePassword = async (current: string, next: string) => {
    await authService.changePassword({ currentPassword: current, newPassword: next });
  };
  const forgotPassword = async (email: string) => { await authService.forgotPassword({ email }); };
  const resetPassword = async (t: string, password: string) => { await authService.resetPassword(t, { password }); };
  const loginWithToken = async (t: string) => { tokenStorage.setToken(t); await hydrate(t); };
  const hasRole = (role: string) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoading, isAuthenticated: !!user && !!token,
        login, loginEmployer, loginAdmin, register, registerEmployer, logout, refresh,
        updateProfile, updatePassword, forgotPassword, resetPassword,
        loginWithToken, hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
