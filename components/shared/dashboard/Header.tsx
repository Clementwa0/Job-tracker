"use client";

import { useMemo, useState } from "react";
import { ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { getInitials } from "./utils";
import type { DashboardConfig } from "./types";

const Header = ({ config }: { config: DashboardConfig }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const userName = user?.name ?? "";

  const initials = useMemo(() => getInitials(userName, "JT"), [userName]);

  const handleLogout = async () => {
    const name = user?.name;
    await logout();
    router.replace(config.loginPath);
    toast.success("Logged out successfully", {
      description: name ? `Goodbye ${name}` : "See you next time!",
    });
  };

  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-2 border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-4 md:px-6">
      {/* Search - optional per role; hidden on the smallest screens */}
      {config.header.searchPlaceholder && (
        <div className="relative hidden min-w-0 w-full max-w-sm sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={config.header.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/40 pl-9 pr-3 text-[13px] text-foreground shadow-sm transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-1">
        
        {/* Notifications */}
        {config.header.notifications && <NotificationBell />}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? (
            <Sun className="h-[17px] w-[17px]" strokeWidth={2} />
          ) : (
            <Moon className="h-[17px] w-[17px]" strokeWidth={2} />
          )}
        </Button>

        {/* Divider */}
        <div className="mx-1.5 hidden h-5 w-px bg-border/70 sm:block" />

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="group flex h-auto items-center gap-2 rounded-lg p-1 pr-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Open profile menu"
          >
            <Avatar className="h-8 w-8 border border-border/60 shadow-sm">
              <AvatarImage src={user?.picture || undefined} alt={user?.name || "Profile"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden max-w-[140px] text-left lg:block">
              <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                {user?.name || config.header.fallbackName}
              </p>
              <p className="truncate text-[10.5px] leading-tight text-muted-foreground/80">
                {config.header.roleLabel}
              </p>
            </div>

            <ChevronDown
              className="hidden h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180 lg:block"
              strokeWidth={2.2}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-60 rounded-xl border-border/70 p-1.5 shadow-lg"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {user?.name || config.header.fallbackName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.email || config.header.roleLabel}
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              {config.header.profileLinks.map(({ label, href, icon: Icon }) => (
                <DropdownMenuItem
                  key={`${label}-${href}`}
                  render={<Link href={href} />}
                  className="cursor-pointer gap-2.5 rounded-md px-2 py-1.5 text-[13px]"
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.1} />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2.1} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;