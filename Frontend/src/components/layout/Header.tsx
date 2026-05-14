import { HelpCircle, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ModeToggle } from "@/constants/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully", {
      description: `Goodbye ${user?.name}`,
    });
  };

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 dark:bg-gray-900">
      {/* LEFT: Greeting */}
      {/* LEFT: Greeting */}
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {getGreeting()}
        </span>

        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {user?.name}
          </h2>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Welcome back to your dashboard
        </p>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="shadow-lg border border-gray-900 dark:border-white cursor-pointer">
              <AvatarImage src="/src/assets/profile.png" />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900">
            <DropdownMenuLabel className="flex flex-col">
              <div>Signed in as</div>
              <div className="font-normal text-sm text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/terms">
                <HelpCircle className="mr-2 h-4 w-4" />
                Terms of Service
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
