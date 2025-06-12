import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home,
  FileEdit,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: FileEdit },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed z-30 top-4 left-4">
        <button
          className="p-2 rounded-md bg-primary text-white"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar Overlay - only for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-sidebar fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isCollapsed ? 'w-20' : 'w-64'}
          md:translate-x-0`}
      >
        {/* Logo */}
        <div className={`px-4 py-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <h1 className="text-2xl font-bold text-sidebar-foreground">JobTrail</h1>}
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors relative
                  ${isCollapsed ? 'justify-center' : ''}
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
              >
                <item.icon className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
                {!isCollapsed && item.name}
                {/* Tooltip */}
                {isCollapsed && (
                  <div className="invisible group-hover:visible absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile and Logout */}
        <div className={`absolute bottom-0 w-full p-4 border-t border-sidebar-border
          ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md text-sidebar-foreground 
              hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative
              ${isCollapsed ? 'justify-center' : 'w-full'}`}
          >
            <LogOut className={`h-5 w-5 ${!isCollapsed && 'mr-3'}`} />
            {!isCollapsed && 'Logout'}
            {/* Tooltip */}
            {isCollapsed && (
              <div className="invisible group-hover:visible absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1  mt-6 p-2 relative transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
