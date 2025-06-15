import React from "react";
import { Link, useLocation } from "react-router-dom";
import { links, user } from "../../constants";
import { cn } from  "../../lib/utils";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-gray-100 h-screen transition-all duration-300 border-sky-500 border-r shadow-lg flex flex-col",
    collapsed ? "w-14" : "w-50"
      )}
    >
      <div className="p-4 border-b flex text-blue-700 items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
              J
            </div>
            <span className="ml-2 text-lg font-semibold">JobTracker</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-md bg-primary mx-auto flex items-center justify-center text-primary-foreground font-bold text-xl">
            J
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground"
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"></path>
            </svg>
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
                  'flex items-center gap-2 px-2 py-2 hover:bg-blue-400 hover:text-white rounded-md transition-colors',
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
        <h2 className="text-sm  text-gray-700 mb-2">
          {user?.name}
        </h2> 
        <button
          className={cn(
            " w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed &&  <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
