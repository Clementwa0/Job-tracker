import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService, type AuthResponse } from "@/lib/api";
import { register as registerApi, tokenStorage } from "@/features/auth/api/auth-api";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  jobTitle?: string;
  location?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  notifications?: {
    jobUpdates?: boolean;
    interviewReminders?: boolean;
    weeklySummary?: boolean;
  };
  security?: {
    twoFactorEnabled?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const storedToken = apiService.getToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      return;
    }

    setToken(storedToken);

    (async () => {
      try {
        const res = await apiService.getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        apiService.removeToken();
        setToken(null);
        setUser(null);
      }
    })();
  }, []);

  
  const login = async (email: string, password: string) => {
    const res: AuthResponse = await apiService.login({ email, password });

    const { user, token } = res.data;

    apiService.setToken(token);

    setToken(token);
    setUser(user);

    toast.success("Login successful!");
  };

  
  const register = async (name: string, email: string, password: string) => {
    const res = await registerApi({ name, email, password });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Registration failed");
    }

    const { user, token } = res.data;

    tokenStorage.set(token);

    setToken(token);
    setUser(user);

    toast.success("Account created successfully!");
  };

  
  const logout = () => {
    apiService.removeToken();
    setToken(null);
    setUser(null);
  };

  
  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("User not authenticated");

    setUser((prev) => (prev ? { ...prev, ...data } : null));

    toast.success("Profile updated successfully");
  };

 
  const updatePassword = async () => {
    throw new Error("Password update not implemented");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token, 
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};