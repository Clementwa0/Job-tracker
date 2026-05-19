import { authService } from "@/services/authService";
import { authEvents } from "@/lib/authEvents";
import { tokenStorage } from "@/lib/tokenStorage";
import type { User as ApiUser } from "@/types/auth";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User extends ApiUser {
  avatarUrl?: string;
  jobTitle?: string;
  location?: string;
  phone?: string;
  notifications?: {
    jobUpdates: boolean;
    interviewReminders: boolean;
    weeklySummary: boolean;
  };
  security?: {
    twoFactorEnabled: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setToken(null);
    tokenStorage.removeToken();
  };

  useEffect(() => {
    return authEvents.onUnauthorized(() => {
      clearSession();
      const isPublicRoute = ["/login", "/register", "/"].includes(
        window.location.pathname,
      );
      if (!isPublicRoute) {
        window.location.href = "/login";
      }
    });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to get current user:", error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { user: userData, token: userToken } = response.data;

    setUser(userData);
    setToken(userToken);
    tokenStorage.setToken(userToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password });
    const { user: userData, token: userToken } = response.data;

    setUser(userData);
    setToken(userToken);
    tokenStorage.setToken(userToken);
  };

  const updateProfile = async (userData: Partial<User>) => {
    const response = await authService.updateProfile(userData);
    setUser(response.data.user);
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    await authService.changePassword({ currentPassword, newPassword });
  };

  const logout = () => {
    clearSession();
  };

  const value: AuthContextType = {
    user,
    token,
    updateProfile,
    updatePassword,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
