"use client";

import {
  Menu,
  Moon,
  Settings,
  LogOut,
  Sun,
  UserRound,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "AD";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out", {
        description: "You have been securely signed out.",
      });
      router.replace("/admin/login");
    } catch {
      toast.error("Sign out failed", {
        description: "Please try again.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <p className="truncate text-sm font-medium lg:hidden">JobTrail Admin</p>

      <div className="flex-1" />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <Sun className="hidden size-[17px] dark:block" />
        <Moon className="size-[17px] dark:hidden" />
      </Button>

      {/* Account dropdown */}
      <DropdownMenu>
        {/* Base UI's Trigger already renders a <button> - don't nest another one. */}
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="group flex items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="max-w-[140px] truncate text-[12.5px] font-medium text-foreground">
              {user?.name || "Administrator"}
            </span>
            <span className="max-w-[140px] truncate text-[11px] text-muted-foreground">
              {user?.email || "admin@jobtrail.com"}
            </span>
          </span>

          <ChevronDown
            className="hidden size-3.5 text-muted-foreground transition-transform duration-150 group-data-[popup-open]:rotate-180 sm:block"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={6} className="w-56">
          {/* Identity block - plain div, not DropdownMenuLabel (which is group-scoped). */}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-foreground">
                {user?.name || "Administrator"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email || "admin@jobtrail.com"}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => router.push("/admin/profile")}
            className="cursor-pointer gap-2 text-[13px]"
          >
            <UserRound
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => router.push("/admin/settings")}
            className="cursor-pointer gap-2 text-[13px]"
          >
            <Settings
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={handleLogout}
            className="cursor-pointer gap-2 text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40 dark:focus:text-red-400"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}