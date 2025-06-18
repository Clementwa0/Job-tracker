import React from "react";
import { Link, useLocation } from "react-router-dom";
import { links, user } from "../../constants";
import { cn } from "../../lib/utils";
import { LogOut, SidebarClose, SidebarOpen } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-gray-100 hidden h-screen transition-all duration-300 border-sky-500 border-r shadow-lg flex flex-col",
        collapsed ? "w-14" : "w-35"
      )}
    >
      <div className="p-4 border-b flex text-blue-700 items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-lg font-semibold font-sans">JT</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground"
        >
          {collapsed ? (
            <SidebarOpen/>
          ) : (
           <SidebarClose/>
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-2 text-blue-900 flex flex-col">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 hover:bg-blue-400 hover:text-white rounded-md transition-colors",
                  location.pathname === link.path && "active",
                  collapsed && "justify-center px-2"
                )}
              >
                {<link.icon className="w-5 h-5" />}
                {!collapsed && <span>{link.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t ">
        <h2 className="text-sm  text-gray-700 mb-2">{user?.name}</h2>
        <button className={cn(" w-full", collapsed && "justify-center px-2")}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
