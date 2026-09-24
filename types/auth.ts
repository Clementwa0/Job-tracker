export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: "user" | "employer" | "admin";
  accountStatus?: "active" | "suspended";
  employerCompanyId?: string;
  emailVerified?: boolean;
  picture?: string;
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

/** Used only by admin email/password login - jobseekers and employers authenticate via Google SSO. */
export interface LoginRequest {
  email: string;
  password: string;
}