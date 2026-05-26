import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router-dom";
import { links } from "@/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AppSidebar = () => {
  const location = useLocation();

  const { state, setOpenMobile, isMobile, toggleSidebar } = useSidebar();

  const collapsed = state === "collapsed";

  // Close sidebar only on mobile after navigation
  const handleLinkClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-r
        bg-background
        backdrop-blur
        dark:border-gray-800
        dark:bg-gray-900
        relative
      "
    >
      {/* Toggle Button - Fixed position */}
      <button
        onClick={toggleSidebar}
        className="
          absolute -right-3 top-20 z-50
          flex h-6 w-6 items-center justify-center
          rounded-full border
          bg-background
          shadow-md
          transition-all duration-200
          hover:scale-110
          hover:bg-gray-100
          dark:border-gray-700
          dark:bg-gray-900
          dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-primary
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Header */}
      <SidebarHeader className="border-b h-19 dark:border-gray-800 dark:bg-gray-900">
        <div
          className={`
            flex items-center gap-3 px-3 py-4
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {/* Logo */}
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
            "
          >
            <img
              src="/logo.png"
              alt="JTrail Logo"
              className="h-10 w-10 object-contain"
            />
          </div>

          {/* Brand */}
          {!collapsed && (
            <div className="flex flex-col overflow-hidden dark:bg-gray-900">
              <span
                className="
                  truncate text-lg font-bold tracking-tight
                  text-gray-900 dark:text-white
                "
              >
                JTrail
              </span>

              <span
                className="
                  text-xs text-muted-foreground
                "
              >
                Job Tracking Dashboard
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4 dark:bg-gray-900">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {links.map((item) => {
                const Icon = item.icon;

                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="
                        h-11 rounded-xl
                        transition-all duration-200
                        hover:bg-sky-900
                        hover:text-primary
                        data-[active=true]:bg-sky-900
                        data-[active=true]:text-white
                        data-[active=true]:shadow-md
                      "
                    >
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`
                          flex items-center
                          ${collapsed ? "justify-center" : "gap-3 px-3"}
                        `}
                      >
                        <Icon
                          className={`
                            h-5 w-5 shrink-0
                            transition-transform duration-200
                            group-hover:scale-110
                          `}
                        />

                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      {!collapsed && (
        <SidebarFooter className="border-t dark:border-gray-800 dark:bg-gray-900">
          <div className="px-3 py-4">
            <div
              className="
                rounded-xl border
                bg-muted/40
                p-3
                dark:border-gray-800
                dark:bg-gray-800/40
              "
            >
              <p className="text-xs font-semibold text-foreground">
                © 2026 JTrail
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Manage your job applications efficiently
              </p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;