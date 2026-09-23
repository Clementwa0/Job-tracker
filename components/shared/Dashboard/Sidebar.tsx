"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  FileSearch,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/features/auth/hooks/AuthContext";

/* ---------- Navigation config ---------- */

const mainNavigation = [
  { title: "Dashboard", href: "/jobseeker", icon: LayoutDashboard },
  { title: "Applications", href: "/jobseeker/applications", icon: BriefcaseBusiness },
  { title: "Interviews", href: "/jobseeker/interviews", icon: CalendarDays },
  { title: "Calendar", href: "/jobseeker/calendar", icon: CalendarDays },
  { title: "Resumes", href: "/jobseeker/resumes", icon: FileText },
  { title: "CV Review", href: "/jobseeker/cv-review", icon: FileSearch },
  { title: "Analytics", href: "/jobseeker/analytics", icon: BarChart3 },
];

const discoveryNavigation = [
  { title: "Browse Jobs", href: "/job-board", icon: Search },
];

const accountNavigation = [
  { title: "Settings", href: "/jobseeker/settings", icon: Settings },
  { title: "Help & Support", href: "/jobseeker/help", icon: HelpCircle },
];

const bottomNavItems = [
  { title: "Home", href: "/jobseeker", icon: LayoutDashboard },
  { title: "Applications", href: "/jobseeker/applications", icon: BriefcaseBusiness },
  { title: "Analytics", href: "/jobseeker/analytics", icon: BarChart3 },
  { title: "Interviews", href: "/jobseeker/interviews", icon: CalendarDays },
];

/* ---------- Helpers ---------- */

function normalize(path: string) {
  if (!path) return "/";
  const stripped = path.split("?")[0].split("#")[0];
  const trimmed = stripped.replace(/\/+$/, "");
  return trimmed || "/";
}

function isPathActive(pathname: string, href: string) {
  const current = normalize(pathname);
  const target = normalize(href);

  if (target === "/jobseeker") {
    return current === "/jobseeker";
  }
  return current === target || current.startsWith(`${target}/`);
}

/* ---------- Shared styles ---------- */

const groupLabelClass =
  "px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60";

const navButtonClass = `
  group/nav
  h-9
  rounded-lg
  px-2.5
  text-[13px]
  font-medium
  text-muted-foreground
  transition-all
  duration-200
  hover:bg-muted
  hover:text-foreground
  data-active:bg-gradient-to-r
  data-active:from-blue-500
  data-active:to-indigo-600
  data-active:text-white
  data-active:shadow-sm
  data-active:shadow-blue-500/25
  data-active:hover:from-blue-500
  data-active:hover:to-indigo-600
  data-active:hover:text-white
`;

/* ---------- Desktop sidebar ---------- */

const AppSidebar = () => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { logout, user } = useAuth();

  const handleLinkClick = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const isActive = React.useCallback(
    (href: string) => isPathActive(pathname, href),
    [pathname],
  );

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "JT";

  const renderNavigation = (items: typeof mainNavigation) => (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={active}
              className={navButtonClass}
              render={<Link href={item.href} onClick={handleLinkClick} />}
            >
              <Icon
                className="size-4 shrink-0 transition-transform duration-200 group-hover/nav:scale-[1.08]"
                strokeWidth={2.1}
              />
              <span className="truncate">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-r
        border-border/70
        [&_[data-slot=sidebar-inner]]:bg-background/80
        [&_[data-slot=sidebar-inner]]:backdrop-blur-xl
        [&_[data-slot=sidebar-inner]]:supports-[backdrop-filter]:bg-background/70
      "
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border/70 p-2">
        <div className="flex h-10 items-center gap-2.5 px-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-600/10 ring-1 ring-inset ring-border/60 group-data-[collapsible=icon]:hidden">
            <img
              src="/logo.png"
              alt="JobTrail"
              className="size-6 object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[14px] font-semibold leading-tight tracking-tight text-foreground">
              JobTrail
            </span>
            <span className="truncate text-[10.5px] leading-tight text-muted-foreground/80">
              Job application tracker
            </span>
          </div>

          <SidebarTrigger
            className="ml-auto h-8 w-8 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-data-[collapsible=icon]:mx-auto"
            aria-label="Toggle sidebar"
          />
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="gap-3 px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className={groupLabelClass}>
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            {renderNavigation(mainNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className={groupLabelClass}>
            Discover
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            {renderNavigation(discoveryNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className={groupLabelClass}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            {renderNavigation(accountNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user + sign out */}
      <SidebarFooter className="border-t border-border/70 p-2">
        <div className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25">
            {initials}
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[12.5px] font-medium leading-tight text-foreground">
              {user?.name ?? "Guest"}
            </span>
            <span className="truncate text-[10.5px] leading-tight text-muted-foreground">
              Signed in
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-3.5" strokeWidth={2.1} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

/* ---------- Mobile horizontal navigation ---------- */

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) => isPathActive(pathname, href);

  return (
    <nav
      aria-label="Primary"
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        border-t
        border-border/60
        bg-background/85
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/70
        md:hidden
      "
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5"
            >
              <span
                className={`
                  flex h-8 w-14 items-center justify-center rounded-full
                  transition-all duration-200
                  ${
                    active
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/30"
                      : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  }
                `}
              >
                <Icon className="size-[18px]" strokeWidth={2.1} />
              </span>

              <span
                className={`
                  text-[10.5px] font-medium leading-none transition-colors
                  ${active ? "text-foreground" : "text-muted-foreground/80"}
                `}
              >
                {item.title}
              </span>
            </Link>
          );
        })}

        {/* More — opens the full sidebar sheet */}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          aria-label="Open menu"
          className="group flex flex-1 flex-col items-center justify-center gap-1 py-1.5"
        >
          <span className="flex h-8 w-14 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 group-hover:bg-muted group-hover:text-foreground">
            <Menu className="size-[18px]" strokeWidth={2.1} />
          </span>

          <span className="text-[10.5px] font-medium leading-none text-muted-foreground/80 transition-colors group-hover:text-foreground">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}