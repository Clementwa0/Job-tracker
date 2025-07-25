import { apiService, type AuthResponse } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
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
    newPassword: string
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

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = apiService.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await apiService.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to get current user:", error);
          apiService.removeToken();
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiService.login({
        email,
        password,
      });
      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);
      apiService.setToken(userToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response: AuthResponse = await apiService.register({
        name,
        email,
        password,
      });
      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);
      apiService.setToken(userToken);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
  try {
    const response = await apiService.updateUserProfile(userData);
    setUser(response.data.user);
  } catch (error) {
    throw error;
  }
};


const updatePassword = async (currentPassword: string, newPassword: string) => {
  try {
    await apiService.changePassword({ currentPassword, newPassword });
  } catch (error) {
    throw error;
  }
};

  const logout = () => {
    setUser(null);
    setToken(null);
    apiService.removeToken();
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
