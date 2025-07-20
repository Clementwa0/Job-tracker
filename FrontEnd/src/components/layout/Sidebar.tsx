import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { links } from "@/constants";
import { cn } from "../../lib/utils";
import { LucideMenu, SidebarClose, SidebarOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";


const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <>
      {/* Toggle Button (Mobile Only) */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50  md:hidden dark:bg-gray-900 p-2">
          <Button onClick={toggleMenu} variant="primary" className="h-10 w-10 text-gray-900 shadow-md dark:text-white">
            {menuOpen ? (
                <SidebarClose/>
            ) : (
                <LucideMenu/>
            )}
          </Button>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-40 bg-white opacity-90 shadow-lg mt-15 w-50 h-screen p-3 dark:bg-gray-900">
          <nav>
            <ul className="space-y-2 text-md text-brown-900 flex flex-col">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 hover:bg-blue-700 hover:text-white rounded-md transition-colors",
                      location.pathname === link.path && "active"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <div className="hidden md:block dark:bg-gray-900">
        <div
          className={cn(
            "h-screen transition-all duration-300 border-sky-500 border-r shadow-lg flex flex-col bg-wheat",
            collapsed ? "w-14" : "w-35"
          )}
        >
          <div className="p-3 border-b flex text-black items-center justify-between">
            {!collapsed && (
              <span className="text-lg font-semibold dark:text-white">JT</span>
            )}
            <Button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-gray hover:bg-blue-700 hover:text-white dark:text-white"
            >
              {collapsed ? <SidebarOpen /> : <SidebarClose />}
            </Button>
          </div>

          <nav className="flex-1 py-4 px-2 dark:bg-gray-900">
            <ul className="space-y-2 text-md text-brown-700 flex flex-col">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 hover:bg-blue-700 hover:text-white rounded-md transition-colors",
                      location.pathname === link.path && "active",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {!collapsed && <span>{link.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
