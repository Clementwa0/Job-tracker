export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: "user" | "employer" | "admin";
  accountStatus?: "active" | "suspended";
  employerCompanyId?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthData;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}