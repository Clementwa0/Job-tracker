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
import profileImg from "@/assets/profile.png";

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
    <header className="bg-background border-b border-border h-16 flex items-center justify-end px-4 lg:px-6 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>

        <div className="flex items-center gap-2 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="shadow-lg border border-gray-900 dark:border-white cursor-pointer">
                <AvatarImage src={profileImg} />{" "}
                <AvatarFallback>{user?.name}</AvatarFallback>
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
                <Link
                  to="/profile"
                  className="cursor-pointer hover:bg-blue-600"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/terms" className="cursor-pointer hover:bg-blue-600">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Terms of Service</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
