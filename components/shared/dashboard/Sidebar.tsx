"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
import { getInitials, isRouteActive } from "./utils";
import type { DashboardConfig, DashboardNavItem } from "./types";

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

/* ---------- Sidebar (shared by every role) ---------- */

const AppSidebar = ({ config }: { config: DashboardConfig }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { logout, user } = useAuth();

  const handleLinkClick = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const handleLogout = React.useCallback(async () => {
    if (isMobile) setOpenMobile(false);
    await logout();
    router.replace(config.loginPath);
  }, [isMobile, setOpenMobile, logout, router, config.loginPath]);

  const initials = getInitials(user?.name, "JT");

  const renderNavigation = (items: DashboardNavItem[]) => (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const active = isRouteActive(pathname, item.href, item.exact);
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
              src={config.brand.logoSrc}
              alt={config.brand.name}
              className="size-6 object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[14px] font-semibold leading-tight tracking-tight text-foreground">
              {config.brand.name}
            </span>
            <span className="truncate text-[10.5px] leading-tight text-muted-foreground/80">
              {config.brand.tagline}
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
        {config.sections.map((section) => (
          <SidebarGroup key={section.label} className="p-0">
            <SidebarGroupLabel className={groupLabelClass}>
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-1">
              {renderNavigation(section.items)}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer - user + sign out */}
      <SidebarFooter className="border-t border-border/70 p-2">
        <div className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25">
            {initials}
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[12.5px] font-medium leading-tight text-foreground">
              {user?.name ?? config.header.fallbackName}
            </span>
            <span className="truncate text-[10.5px] leading-tight text-muted-foreground">
              {config.header.roleLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
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
