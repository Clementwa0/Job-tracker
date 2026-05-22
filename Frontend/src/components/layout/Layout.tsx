import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

import {
  SidebarProvider,
  useSidebar,
} from "../ui/sidebar";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Custom styled sidebar trigger with animations
const StyledSidebarTrigger = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  
  return (
    <>
      {/* Mobile overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setOpenMobile(false)}
        />
      )}
      
      <button
        onClick={() => setOpenMobile(!openMobile)}
        className={cn(
          "fixed left-4 top-4 z-50 md:hidden",
          "flex h-11 w-11 items-center justify-center",
          "rounded-xl border-2 border-border/50",
          "bg-gradient-to-br from-background to-muted/30",
          "backdrop-blur-md",
          "text-foreground transition-all duration-300",
          "hover:scale-105 hover:border-primary/50",
          "hover:shadow-lg hover:shadow-primary/20",
          "active:scale-95",
          "dark:border-gray-700 dark:from-gray-900 dark:to-gray-800/50",
          "dark:hover:border-primary/50",
          openMobile && "scale-95 border-primary bg-primary/10"
        )}
      >
        <Menu className={cn(
          "h-4 w-4 transition-transform duration-300",
          openMobile && "rotate-90"
        )} />
        <span className="sr-only">{openMobile ? "Close menu" : "Open menu"}</span>
      </button>
    </>
  );
};

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex h-screen w-full overflow-hidden bg-background dark:bg-gray-900">
        
        <div className="fixed inset-0 -z-10 dark:bg-gray-900" />
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Mobile Sidebar Trigger */}
        <StyledSidebarTrigger />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
          
          {/* Top Bar with glass morphism effect */}
          <div
            className={cn(
              "sticky top-0 z-30",
              "border-b border-border/50",
              "bg-background/80 backdrop-blur-xl",
              "transition-all duration-300",
              "dark:border-gray-800/50 dark:bg-gray-900/80",
              scrolled && "shadow-lg shadow-black/5"
            )}
          >
            <div className="flex items-center justify-between gap-4  py-3  md:py-4">
              <div className="flex-1">
                <Header />
              </div>
              
              {/* Right spacer for balance */}
              <div className="hidden md:block w-8" />
            </div>
          </div>

          {/* Page Content with smooth animations */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <Outlet />
              </div>
            </div>
          </main>
          
          {/* Subtle gradient at bottom for visual depth */}
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent opacity-60 dark:from-gray-900" />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;