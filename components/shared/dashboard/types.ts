import type { LucideIcon } from "lucide-react";
import type { TabIcon } from "./MobileIcons";

export type DashboardRole = "user" | "employer" | "admin";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Match the path exactly (use for dashboard roots so they don't stay active on sub-pages). */
  exact?: boolean;
}

export interface DashboardNavSection {
  label: string;
  items: DashboardNavItem[];
}

export interface MobileTabItem {
  title: string;
  href: string;
  icon: TabIcon;
  exact?: boolean;
}

export interface DashboardProfileLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardConfig {
  /** Role allowed inside this shell (matches `user.role`). */
  role: DashboardRole;
  /** Where unauthenticated / wrong-role visitors are sent, and where sign-out lands. */
  loginPath: string;

  brand: { name: string; tagline: string; logoSrc: string };

  /** Sidebar groups, in order. */
  sections: DashboardNavSection[];

  mobile: {
    /** Centre, raised button. Always matched exactly. */
    home: { title: string; href: string };
    left: MobileTabItem[];
    /** Tabs to the right of the notch; the "More" button (opens the sidebar) is appended after them. */
    right: MobileTabItem[];
  };

  header: {
    /** Shown under the user's name, e.g. "Job Seeker". */
    roleLabel: string;
    fallbackName: string;
    /** Omit to hide the search box. */
    searchPlaceholder?: string;
    /** Show the notification bell (only roles the notifications API serves). */
    notifications: boolean;
    profileLinks: DashboardProfileLink[];
  };
}
