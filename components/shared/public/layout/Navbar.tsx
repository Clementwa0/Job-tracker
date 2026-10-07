"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { cn } from "@/lib/utils";

/* =========================================================
   TYPES & CONSTANTS
========================================================= */

type NavIcon = typeof BriefcaseBusiness;

type DropdownItem = {
  label: string;
  description: string;
  href: string;
  icon: NavIcon;
};

type DropdownConfig = {
  label: string;
  items: DropdownItem[];
};

const ROUTES = {
  home: "/",
  jobs: "/job-board",
  login: "/account",
  dashboard: "/jobseeker",
  resume: "/jobseeker/resume",
  interview: "/jobseeker/interview",
  employerLogin: "/employer/login",
  employerDashboard: "/employer",
  about: "/about",
  resources: "/resources",
  resumeTips: "/resume-tips",
  interviewGuide: "/interview-guide",
} as const;

const DROPDOWNS: DropdownConfig[] = [
  {
    label: "For Job Seekers",
    items: [
      {
        label: "Find Jobs",
        description: "Discover opportunities that match your skills",
        href: ROUTES.jobs,
        icon: BriefcaseBusiness,
      },
      {
        label: "My Dashboard",
        description: "Track applications and manage your career",
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Resume Builder",
        description: "Create and improve your professional resume",
        href: ROUTES.resume,
        icon: FileText,
      },
      {
        label: "Interview Preparation",
        description: "Prepare for your next interview",
        href: ROUTES.interview,
        icon: Sparkles,
      },
    ],
  },
  {
    label: "For Employers",
    items: [
      {
        label: "Post a Job",
        description: "Reach qualified candidates faster",
        href: ROUTES.employerLogin,
        icon: BriefcaseBusiness,
      },
      {
        label: "Employer Dashboard",
        description: "Manage jobs, applicants and hiring",
        href: ROUTES.employerDashboard,
        icon: Building2,
      },
      {
        label: "Employer Login",
        description: "Access your employer account",
        href: ROUTES.employerLogin,
        icon: Users,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Career Resources",
        description: "Practical resources to help you move forward",
        href: ROUTES.resources,
        icon: BookOpen,
      },
      {
        label: "Resume Tips",
        description: "Build a stronger and more effective resume",
        href: ROUTES.resumeTips,
        icon: FileText,
      },
      {
        label: "Interview Guide",
        description: "Practical guidance for better interviews",
        href: ROUTES.interviewGuide,
        icon: Sparkles,
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const isActivePath = (pathname: string, href: string) => {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * Used only to determine whether a dropdown contains the
 * current route. This is intentionally NOT used to style
 * the dropdown trigger as active.
 */
const isDropdownActive = (pathname: string, dropdown: DropdownConfig) => {
  return dropdown.items.some((item) => isActivePath(pathname, item.href));
};

const primaryButtonClasses = cn(
  "bg-gradient-to-r from-[#4435f5] via-[#5142ff] to-[#6170f7]",
  "text-white shadow-[0_10px_25px_rgba(75,65,245,0.20)]",
  "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(75,65,245,0.28)]",
  "active:translate-y-0",
);

/* =========================================================
   BRAND
========================================================= */

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href={ROUTES.home}
      aria-label="JobTrail home"
      onClick={onClick}
      className={cn(
        "group flex shrink-0 items-center gap-3 rounded-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#5147ee]/30 focus-visible:ring-offset-2",
      )}
    >
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="h-full w-full object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
          priority
        />
      </span>

      <span className="text-[24px] font-bold tracking-[-1.35px] text-[#101d3b] transition-colors duration-200 group-hover:text-[#5147ee]">
        JobTrail
      </span>
    </Link>
  );
}

/* =========================================================
   DESKTOP DROPDOWN
========================================================= */

function DesktopDropdown({
  dropdown,
  pathname,
}: {
  dropdown: DropdownConfig;
  pathname: string;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "h-12 rounded-full px-4 text-[14px] font-medium",
          "bg-transparent text-[#111d3a]",
          "hover:bg-[#f7f7fb] hover:text-[#5147ee]",
          "focus:bg-[#f7f7fb] focus:text-[#5147ee]",
          "data-[state=open]:bg-[#f3f2ff]",
          "data-[state=open]:text-[#5147ee]",
          "data-[state=open]:hover:bg-[#f3f2ff]",
          "data-[state=open]:hover:text-[#5147ee]",
          "data-[state=open]:focus:bg-[#f3f2ff]",
          "data-[state=open]:focus:text-[#5147ee]",
        )}
      >
        {dropdown.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <div className="w-[340px] p-2.5">
          <div className="px-3 pb-2 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#969caf]">
              {dropdown.label}
            </p>
          </div>

          <div className="grid gap-1">
            {dropdown.items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <NavigationMenuLink
                  key={item.label}
                  render={<Link href={item.href} />}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex select-none items-start gap-3 rounded-[14px]",
                    "px-3 py-3 text-[13px] leading-none no-underline outline-none",
                    "transition-colors duration-150",
                    "hover:bg-[#f6f5ff] focus:bg-[#f6f5ff]",
                    active && "bg-[#f3f2ff]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center",
                      "rounded-[10px] bg-[#f1f0ff] text-[#554aff]",
                      "transition-colors group-hover:bg-[#e8e6ff]",
                      active && "bg-[#e8e6ff]",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-[17px] w-[17px]"
                      strokeWidth={1.9}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[13px] font-semibold transition-colors",
                        active
                          ? "text-[#5147ee]"
                          : "text-[#14213f] group-hover:text-[#5147ee]",
                      )}
                    >
                      {item.label}
                    </span>

                    <span className="mt-0.5 block text-[11px] leading-[1.5] text-[#727c95]">
                      {item.description}
                    </span>
                  </span>

                  <ArrowRight
                    aria-hidden="true"
                    className={cn(
                      "ml-auto mt-1 h-4 w-4 shrink-0 -translate-x-1 text-[#b1b5c5] opacity-0",
                      "transition-all duration-150",
                      "group-hover:translate-x-0 group-hover:text-[#5147ee] group-hover:opacity-100",
                      active && "translate-x-0 text-[#5147ee] opacity-100",
                    )}
                  />
                </NavigationMenuLink>
              );
            })}
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

/* =========================================================
   MAIN NAV COMPONENT
========================================================= */

export default function Nav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null,
  );
  const [scrolled, setScrolled] = useState(false);

  const isAuthed = Boolean(user);

  /* ---------------------------------------------------------
     Scroll state
  --------------------------------------------------------- */

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ---------------------------------------------------------
     Reset mobile navigation on route change
  --------------------------------------------------------- */

  useEffect(() => {
    setMobileOpen(false);
    setOpenMobileDropdown(null);
  }, [pathname]);

  /* ---------------------------------------------------------
     Resize safety
  --------------------------------------------------------- */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setOpenMobileDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ---------------------------------------------------------
     Mobile helpers
  --------------------------------------------------------- */

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenMobileDropdown(null);
  }, []);

  const toggleMobileDropdown = useCallback((label: string) => {
    setOpenMobileDropdown((previous) => (previous === label ? null : label));
  }, []);

  /* ---------------------------------------------------------
     Active routes
  --------------------------------------------------------- */

  const activeHome = isActivePath(pathname, ROUTES.home);
  const activeJobs = isActivePath(pathname, ROUTES.jobs);
  const activeAbout = isActivePath(pathname, ROUTES.about);

  return (
    <>
      {/* =====================================================
          STICKY HEADER
      ===================================================== */}

      <header
        className={cn(
          "sticky top-0 z-50 px-4 sm:px-6 lg:px-8",
          "transition-all duration-300 motion-reduce:transition-none",
          scrolled ? "pt-2.5 lg:pt-3" : "pt-5 lg:pt-6",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1470px] items-center",
            "border border-white/90 bg-white/95 backdrop-blur-xl",
            "transition-all duration-300 motion-reduce:transition-none",
            scrolled
              ? "min-h-[68px] rounded-[22px] px-4 shadow-[0_12px_40px_rgba(55,65,180,0.14)] sm:px-6 lg:px-7"
              : "min-h-[76px] rounded-[28px] px-5 shadow-[0_18px_55px_rgba(55,65,180,0.10)] sm:px-7 lg:px-8",
          )}
        >
          <Brand />

          {/* =================================================
              DESKTOP NAV
          ================================================= */}

          <NavigationMenu className="ml-auto hidden max-w-none lg:flex">
            <NavigationMenuList className="gap-1">
              {/* -------------------------------------------------
                  FIND JOBS
              ------------------------------------------------- */}

              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link href={ROUTES.jobs} />}
                  aria-current={activeJobs ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                    }),
                    "mr-2 h-12 gap-2.5 rounded-full px-5 text-[14px] font-semibold",
                    "bg-[#f3f2ff] text-[#4d42ed]",
                    "hover:bg-[#ebe9ff] hover:text-[#4c42ee]",
                    "focus:bg-[#ebe9ff] focus:text-[#4c42ee]",
                    activeJobs && "bg-[#eceaff] text-[#4c42ee]",
                  )}
                >
                  <BriefcaseBusiness
                    aria-hidden="true"
                    className="h-[19px] w-[19px]"
                    strokeWidth={2}
                  />
                  <span>Find Jobs</span>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* -------------------------------------------------
                  DROPDOWNS
              ------------------------------------------------- */}

              {DROPDOWNS.map((dropdown) => (
                <DesktopDropdown
                  key={dropdown.label}
                  dropdown={dropdown}
                  pathname={pathname}
                />
              ))}

              {/* -------------------------------------------------
                  ABOUT
              ------------------------------------------------- */}

              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link href={ROUTES.about} />}
                  aria-current={activeAbout ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                    }),
                    "h-12 rounded-full px-4 text-[14px] font-medium",
                    "bg-transparent text-[#111d3a]",
                    "hover:bg-[#f7f7fb] hover:text-[#5147ee]",
                    "focus:bg-[#f7f7fb] focus:text-[#5147ee]",
                    activeAbout && "bg-[#f3f2ff] text-[#5147ee]",
                  )}
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>

            {/* -------------------------------------------------
                SEARCH
            ------------------------------------------------- */}

            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href={ROUTES.jobs} />}
              aria-label="Search jobs"
              title="Search jobs"
              className="ml-1 h-11 w-11 rounded-full text-[#111d3a] hover:bg-[#f5f5fa] hover:text-[#5147ee]"
            >
              <Search className="h-[21px] w-[21px]" strokeWidth={1.9} />
            </Button>

            {/* =================================================
                AUTHENTICATED STATE
            ================================================= */}

            {isLoading ? (
              <Skeleton className="ml-2 h-11 w-24 rounded-full bg-[#f1f1f7]" />
            ) : isAuthed ? (
              <Button
                render={<Link href={ROUTES.dashboard} />}
                nativeButton={false}
                className={cn(
                  "ml-2 h-11 gap-2 rounded-full px-5 text-[14px] font-semibold",
                  primaryButtonClasses,
                )}
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className="h-[17px] w-[17px]"
                  strokeWidth={1.9}
                />
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  render={<Link href={ROUTES.login} />}
                  nativeButton={false}
                  className="ml-1 h-11 rounded-full px-4 text-[14px] font-medium text-[#111d3a] hover:bg-transparent hover:text-[#5147ee]"
                >
                  <UserRound
                    aria-hidden="true"
                    className="mr-2 h-[17px] w-[17px]"
                    strokeWidth={1.8}
                  />
                  Log in
                </Button>

                <Button
                  render={<Link href={ROUTES.login} />}
                  nativeButton={false}
                  className={cn(
                    "ml-1 h-12 gap-3 rounded-[13px] px-6 text-[14px] font-semibold",
                    primaryButtonClasses,
                  )}
                >
                  Get started
                  <ArrowRight
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                  />
                </Button>
              </>
            )}
          </NavigationMenu>

          {/* =================================================
              MOBILE ACTIONS
          ================================================= */}

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {!isLoading && !isAuthed && (
              <Button
                variant="ghost"
                render={<Link href={ROUTES.login} />}
                nativeButton={false}
                className="hidden rounded-full px-3 py-2.5 text-sm font-medium text-[#111d3a] hover:bg-transparent min-[420px]:inline-flex"
              >
                Log in
              </Button>
            )}

            {!isLoading && isAuthed && (
              <Button
                render={<Link href={ROUTES.dashboard} />}
                nativeButton={false}
                className={cn(
                  "h-auto gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-semibold",
                  primaryButtonClasses,
                )}
              >
                <LayoutDashboard aria-hidden="true" className="h-4 w-4" />

                <span className="hidden min-[420px]:inline">Dashboard</span>
              </Button>
            )}

            {!isLoading && !isAuthed && (
              <Button
                render={<Link href={ROUTES.login} />}
                nativeButton={false}
                className={cn(
                  "h-auto rounded-full px-4 py-2.5 text-sm font-semibold",
                  primaryButtonClasses,
                )}
              >
                Get started
              </Button>
            )}

            {/* =================================================
                MOBILE SHEET
            ================================================= */}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className={cn(
                      "h-11 w-11 rounded-full border border-[#e7e7f1] bg-white text-[#111d3a] shadow-sm",
                      "hover:border-[#c9c6ff] hover:bg-[#f7f6ff] hover:text-[#5147ee]",
                    )}
                  />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex w-full max-w-[410px] flex-col gap-0 border-l border-[#e7e7f1] p-0 sm:max-w-[410px]"
              >
                <SheetHeader className="flex h-[78px] shrink-0 flex-row items-center justify-between space-y-0 border-b border-[#ececf3] px-5">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  <SheetDescription className="sr-only">
                    Site navigation and account actions
                  </SheetDescription>

                  <Brand onClick={closeMobile} />
                </SheetHeader>

                <nav
                  className="flex-1 overflow-y-auto px-5 py-7"
                  aria-label="Mobile navigation"
                >
                  <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8991a8]">
                    Navigation
                  </p>

                  <div className="grid gap-1.5">
                    {/* -------------------------------------------------
                        FIND JOBS
                    ------------------------------------------------- */}

                    <SheetClose
                      render={<Link href={ROUTES.jobs} />}
                      aria-current={activeJobs ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-4 text-[15px] font-semibold",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                        activeJobs
                          ? "bg-[#f3f2ff] text-[#5147ee]"
                          : "text-[#18243f] hover:bg-[#f7f7fb]",
                      )}
                    >
                      <BriefcaseBusiness
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                      Find Jobs
                    </SheetClose>

                    {/* -------------------------------------------------
                        DROPDOWNS
                    ------------------------------------------------- */}

                    {DROPDOWNS.map((dropdown) => {
                      const isOpen = openMobileDropdown === dropdown.label;

                      return (
                        <div key={dropdown.label}>
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => toggleMobileDropdown(dropdown.label)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-[15px] font-medium",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                              isOpen
                                ? "bg-[#f3f2ff] text-[#5147ee]"
                                : "text-[#18243f] hover:bg-[#f7f7fb]",
                            )}
                          >
                            <span>{dropdown.label}</span>

                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={cn(
                                "h-4 w-4 text-[#858da4] transition-transform duration-200 motion-reduce:transition-none",
                                isOpen && "rotate-180 text-[#5147ee]",
                              )}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>

                          {isOpen && (
                            <div className="mt-1 space-y-1 pl-2">
                              {dropdown.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActivePath(
                                  pathname,
                                  item.href,
                                );

                                return (
                                  <SheetClose
                                    key={item.label}
                                    render={<Link href={item.href} />}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                      "group flex items-start gap-3 rounded-2xl px-4 py-3",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                                      active
                                        ? "bg-[#f3f2ff]"
                                        : "hover:bg-[#f8f7ff]",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                                        "bg-[#f1f0ff] text-[#554aff]",
                                        active && "bg-[#e8e6ff]",
                                      )}
                                    >
                                      <Icon
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                      />
                                    </span>

                                    <span className="min-w-0">
                                      <span
                                        className={cn(
                                          "block text-[13px] font-semibold",
                                          active
                                            ? "text-[#5147ee]"
                                            : "text-[#18243f]",
                                        )}
                                      >
                                        {item.label}
                                      </span>

                                      <span className="mt-0.5 block text-[11px] leading-[1.45] text-[#788197]">
                                        {item.description}
                                      </span>
                                    </span>
                                  </SheetClose>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* -------------------------------------------------
                        ABOUT
                    ------------------------------------------------- */}

                    <SheetClose
                      render={<Link href={ROUTES.about} />}
                      aria-current={activeAbout ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-2xl px-4 py-4 text-[15px] font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                        activeAbout
                          ? "bg-[#f3f2ff] text-[#5147ee]"
                          : "text-[#18243f] hover:bg-[#f7f7fb]",
                      )}
                    >
                      About
                    </SheetClose>
                  </div>

                  <Separator className="my-7 bg-[#ececf3]" />

                  {/* =================================================
                      BUSINESS
                  ================================================= */}

                  <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8991a8]">
                    Business
                  </p>

                  <SheetClose
                    render={<Link href={ROUTES.employerLogin} />}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-4 text-[15px] font-medium text-[#18243f]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                      "hover:bg-[#f7f7fb]",
                    )}
                  >
                    <span>For Employers</span>

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-[#737c94]"
                    />
                  </SheetClose>

                  <SheetClose
                    render={<Link href={ROUTES.jobs} />}
                    className={cn(
                      "mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-[15px] font-medium text-[#18243f]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                      "hover:bg-[#f7f7fb]",
                    )}
                  >
                    <Search
                      aria-hidden="true"
                      className="h-5 w-5 text-[#626b82]"
                    />
                    Search Jobs
                  </SheetClose>
                </nav>

                {/* =================================================
                    BOTTOM ACTIONS
                ================================================= */}

                <div className="shrink-0 border-t border-[#ececf3] bg-blue-500 p-5">
                  {isAuthed ? (
                    <SheetClose
                      render={<Link href={ROUTES.dashboard} />}
                      className={cn(
                        "flex items-center bg-blue-500 justify-center gap-2 rounded-2xl py-4 text-sm font-semibold",
                        primaryButtonClasses,
                      )}
                    >
                      <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                      Go to Dashboard
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </SheetClose>
                  ) : (
                    <div className="grid gap-2.5">
                      <SheetClose
                        render={<Link href={ROUTES.login} />}
                        className={cn(
                          "rounded-2xl border border-[#deddf0] bg-white py-4 text-center text-sm font-semibold",
                          "text-[#18243f] transition-colors hover:border-[#c8c5ff] hover:bg-[#f8f7ff] hover:text-[#5147ee]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5147ee]/30",
                        )}
                      >
                        Log in
                      </SheetClose>

                      <SheetClose
                        render={<Link href={ROUTES.login} />}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold",
                          primaryButtonClasses,
                        )}
                      >
                        Get started
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
