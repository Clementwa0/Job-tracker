import type { UserRole } from "@/lib/auth/redirects";

const KEY = "jtrail_last_auth_role";

export const roleStorage = {
  get(): UserRole | null {
    const v = localStorage.getItem(KEY);
    if (v === "user" || v === "employer" || v === "admin") return v;
    return null;
  },
  set(role: UserRole) {
    localStorage.setItem(KEY, role);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
