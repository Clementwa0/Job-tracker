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

import { Button } from "@/components/ui/button";
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
   CONFIG
========================================================= */

type NavIcon = typeof BriefcaseBusiness;

type DropdownItem = {
  label: string;
  description: string;
  href: string;
  icon: NavIcon;
};

type DropdownConfig = { label: string; items: DropdownItem[] };

const ROUTES = {
  home: "/",
  jobs: "/job-board",
  login: "/account",
  dashboard: "/jobseeker/dashboard",
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
    label: "Job Seekers",
    items: [
      {
        label: "Find Jobs",
        description: "Discover roles that match your skills",
        href: ROUTES.jobs,
        icon: BriefcaseBusiness,
      },
      {
        label: "My Dashboard",
        description: "Track applications and progress",
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Resume Builder",
        description: "Create a stronger resume",
        href: ROUTES.resume,
        icon: FileText,
      },
      {
        label: "Interview Prep",
        description: "Prepare for your next interview",
        href: ROUTES.interview,
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Employers",
    items: [
      {
        label: "Post a Job",
        description: "Reach qualified candidates faster",
        href: ROUTES.employerLogin,
        icon: BriefcaseBusiness,
      },
      {
        label: "Employer Dashboard",
        description: "Manage jobs and applicants",
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
        description: "Practical career guidance",
        href: ROUTES.resources,
        icon: BookOpen,
      },
      {
        label: "Resume Tips",
        description: "Build a better resume",
        href: ROUTES.resumeTips,
        icon: FileText,
      },
      {
        label: "Interview Guide",
        description: "Guidance for better interviews",
        href: ROUTES.interviewGuide,
        icon: Sparkles,
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const isActivePath = (pathname: string, href: string) =>
  href === ROUTES.home
    ? pathname === ROUTES.home
    : pathname === href || pathname.startsWith(`${href}/`);

/* shared styling (light + dark) */
const navLink = cn(
  "inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[15px] font-medium",
  "text-slate-700 transition-colors",
  "hover:bg-slate-100 hover:text-indigo-600",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
  "dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300",
);

const navLinkActive = cn(
  "bg-indigo-50 text-indigo-600",
  "dark:bg-indigo-500/15 dark:text-indigo-300",
);

const triggerClasses = cn(
  "h-10 rounded-full px-3.5 text-[15px] font-medium",
  "bg-transparent text-slate-700",
  "hover:bg-slate-100 hover:text-indigo-600",
  "focus:bg-slate-100 focus:text-indigo-600",
  "data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-600",
  "data-[state=open]:hover:bg-indigo-50 data-[state=open]:hover:text-indigo-600",
  "data-[state=open]:focus:bg-indigo-50 data-[state=open]:focus:text-indigo-600",
  "dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300",
  "dark:focus:bg-white/10 dark:focus:text-indigo-300",
  "dark:data-[state=open]:bg-indigo-500/15 dark:data-[state=open]:text-indigo-300",
  "dark:data-[state=open]:hover:bg-indigo-500/15 dark:data-[state=open]:hover:text-indigo-300",
  "dark:data-[state=open]:focus:bg-indigo-500/15 dark:data-[state=open]:focus:text-indigo-300",
);

const primaryBtn = cn(
  "h-10 gap-2 rounded-full px-5 text-[15px] font-semibold text-white",
  "bg-indigo-600 shadow-sm transition-colors",
  "hover:bg-indigo-500 active:translate-y-px",
  "dark:bg-indigo-500 dark:hover:bg-indigo-400",
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
        "group flex shrink-0 items-center gap-2.5 rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
      )}
    >
      <Image
        src="/logo.png"
        alt=""
        width={36}
        height={36}
        priority
        className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
      />
      <span className="text-[22px] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
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
      <NavigationMenuTrigger className={triggerClasses}>
        {dropdown.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent
        className={cn(
          "rounded-xl border border-slate-200 bg-white shadow-lg",
          "dark:border-white/10 dark:bg-slate-900",
        )}
      >
        <div className="w-[340px] p-2">
          <div className="grid gap-0.5">
            {dropdown.items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <NavigationMenuLink
                  key={item.label}
                  render={<Link href={item.href} />}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none",
                    "transition-colors hover:bg-slate-100",
                    "focus:bg-slate-100 dark:hover:bg-white/5 dark:focus:bg-white/5",
                    active && "bg-indigo-50 dark:bg-indigo-500/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      "bg-indigo-50 text-indigo-600",
                      "dark:bg-indigo-500/15 dark:text-indigo-300",
                      active && "bg-indigo-100 dark:bg-indigo-500/20",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[15px] font-semibold text-slate-800",
                        "group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300",
                        active && "text-indigo-600 dark:text-indigo-300",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </span>
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
   MAIN NAV
========================================================= */

export default function Nav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isAuthed = Boolean(user);

  /* --- scroll --- */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 16));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* --- reset on route change --- */
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  /* --- close on resize to desktop --- */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  }, []);

  const activeHome = isActivePath(pathname, ROUTES.home);
  const activeJobs = isActivePath(pathname, ROUTES.jobs);
  const activeAbout = isActivePath(pathname, ROUTES.about);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-1 rounded-2xl border px-3 backdrop-blur-xl transition-all duration-300 sm:px-4",
          "border-slate-400 bg-white/85",
          "dark:border-white/10 dark:bg-slate-900/80",
          scrolled
            ? "min-h-[64px] shadow-md shadow-slate-900/5 dark:shadow-black/20"
            : "min-h-[70px] shadow-sm shadow-slate-900/5 dark:shadow-black/10",
        )}
      >
        <Brand onClick={closeMobile} />

        {/* ================= DESKTOP ================= */}
        <NavigationMenu className="ml-auto hidden lg:flex">
          <NavigationMenuList className="gap-0.5">
            {/* Find Jobs */}
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<Link href={ROUTES.jobs} />}
                aria-current={activeJobs ? "page" : undefined}
                className={cn(navLink, activeJobs && navLinkActive)}
              >
                <BriefcaseBusiness className="h-[18px] w-[18px]" strokeWidth={2} />
                Find Jobs
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Dropdowns */}
            {DROPDOWNS.map((d) => (
              <DesktopDropdown key={d.label} dropdown={d} pathname={pathname} />
            ))}

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<Link href={ROUTES.about} />}
                aria-current={activeAbout ? "page" : undefined}
                className={cn(navLink, activeAbout && navLinkActive)}
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href={ROUTES.jobs} />}
            aria-label="Search jobs"
            title="Search jobs"
            className={cn(
              "ml-1 h-10 w-10 rounded-full text-slate-700",
              "hover:bg-slate-100 hover:text-indigo-600",
              "dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300",
            )}
          >
            <Search className="h-5 w-5" strokeWidth={1.9} />
          </Button>

          {/* Auth */}
          {isLoading ? (
            <Skeleton className="ml-1 h-10 w-24 rounded-full bg-slate-100 dark:bg-white/10" />
          ) : isAuthed ? (
            <Button
              nativeButton={false}
              render={<Link href={ROUTES.dashboard} />}
              className={cn("ml-1", primaryBtn)}
            >
              <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.9} />
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href={ROUTES.login} />}
                className={cn(
                  "ml-1 h-10 rounded-full px-3.5 text-[15px] font-medium",
                  "text-slate-700 hover:bg-slate-100 hover:text-indigo-600",
                  "dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300",
                )}
              >
                <UserRound className="mr-1.5 h-[18px] w-[18px]" strokeWidth={1.8} />
                Log in
              </Button>

              <Button
                nativeButton={false}
                render={<Link href={ROUTES.login} />}
                className={cn("ml-1", primaryBtn)}
              >
                Get started
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
              </Button>
            </>
          )}
        </NavigationMenu>

        {/* ================= MOBILE ================= */}
        <div className="ml-auto flex items-center gap-1.5 lg:hidden">
          {!isLoading && !isAuthed && (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.login} />}
              className={cn(
                "hidden h-10 rounded-full px-3.5 text-[15px] font-medium min-[420px]:inline-flex",
                "text-slate-700 hover:bg-slate-100 hover:text-indigo-600",
                "dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300",
              )}
            >
              Log in
            </Button>
          )}

          {!isLoading && isAuthed && (
            <Button
              nativeButton={false}
              render={<Link href={ROUTES.dashboard} />}
              className={cn(primaryBtn, "px-3.5")}
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span className="hidden min-[420px]:inline">Dashboard</span>
            </Button>
          )}

          {!isLoading && !isAuthed && (
            <Button
              nativeButton={false}
              render={<Link href={ROUTES.login} />}
              className={primaryBtn}
            >
              Get started
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className={cn(
                    "h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700",
                    "hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600",
                    "dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
                    "dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300",
                  )}
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className={cn(
                "flex w-full max-w-[400px] flex-col gap-0 border-l p-0",
                "border-slate-200 bg-white",
                "dark:border-white/10 dark:bg-slate-900",
              )}
            >
              <SheetHeader className="flex h-[72px] shrink-0 flex-row items-center border-b border-slate-200 px-5 dark:border-white/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and account actions
                </SheetDescription>
                <Brand onClick={closeMobile} />
              </SheetHeader>

              <nav
                className="flex-1 overflow-y-auto px-3 py-4"
                aria-label="Mobile navigation"
              >
                <div className="grid gap-1">
                  {/* Find Jobs */}
                  <SheetClose
                    render={<Link href={ROUTES.jobs} />}
                    aria-current={activeJobs ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-[16px] font-semibold",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                      activeJobs
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
                    )}
                  >
                    <BriefcaseBusiness className="h-5 w-5" />
                    Find Jobs
                  </SheetClose>

                  {/* Dropdowns */}
                  {DROPDOWNS.map((dropdown) => {
                    const open = openDropdown === dropdown.label;
                    return (
                      <div key={dropdown.label}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => toggleDropdown(dropdown.label)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3.5 py-3.5 text-[16px] font-medium",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                            open
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
                          )}
                        >
                          <span>{dropdown.label}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "h-5 w-5 text-slate-400 transition-transform duration-200 motion-reduce:transition-none",
                              open && "rotate-180 text-indigo-600 dark:text-indigo-300",
                            )}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {open && (
                          <div className="mt-1 grid gap-1 pl-2">
                            {dropdown.items.map((item) => {
                              const Icon = item.icon;
                              const active = isActivePath(pathname, item.href);
                              return (
                                <SheetClose
                                  key={item.label}
                                  render={<Link href={item.href} />}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex items-start gap-3 rounded-xl px-3.5 py-3",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                                    active
                                      ? "bg-indigo-50 dark:bg-indigo-500/10"
                                      : "hover:bg-slate-100 dark:hover:bg-white/5",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                      "bg-indigo-50 text-indigo-600",
                                      "dark:bg-indigo-500/15 dark:text-indigo-300",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span
                                      className={cn(
                                        "block text-[15px] font-semibold",
                                        active
                                          ? "text-indigo-600 dark:text-indigo-300"
                                          : "text-slate-800 dark:text-slate-100",
                                      )}
                                    >
                                      {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-[13px] leading-snug text-slate-500 dark:text-slate-400">
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

                  {/* About */}
                  <SheetClose
                    render={<Link href={ROUTES.about} />}
                    aria-current={activeAbout ? "page" : undefined}
                    className={cn(
                      "flex items-center rounded-xl px-3.5 py-3.5 text-[16px] font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                      activeAbout
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
                    )}
                  >
                    About
                  </SheetClose>
                </div>

                <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

                {/* Business */}
                <SheetClose
                  render={<Link href={ROUTES.employerLogin} />}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-3.5 text-[16px] font-medium",
                    "text-slate-700 hover:bg-slate-100",
                    "dark:text-slate-200 dark:hover:bg-white/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  )}
                >
                  <span>For Employers</span>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </SheetClose>

                <SheetClose
                  render={<Link href={ROUTES.jobs} />}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 text-left text-[16px] font-medium",
                    "text-slate-700 hover:bg-slate-100",
                    "dark:text-slate-200 dark:hover:bg-white/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                  )}
                >
                  <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  Search Jobs
                </SheetClose>
              </nav>

              {/* Bottom actions */}
              <div className="shrink-0 border-t border-slate-200 p-4 dark:border-white/10">
                {isAuthed ? (
                  <SheetClose
                    render={<Link href={ROUTES.dashboard} />}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 py-3.5",
                      primaryBtn,
                      "h-auto",
                    )}
                  >
                    <LayoutDashboard className="h-[18px] w-[18px]" />
                    Go to Dashboard
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </SheetClose>
                ) : (
                  <div className="grid gap-2.5">
                    <SheetClose
                      render={<Link href={ROUTES.login} />}
                      className={cn(
                        "rounded-full border border-slate-200 bg-white py-3.5 text-center text-[15px] font-semibold",
                        "text-slate-800 transition-colors",
                        "hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600",
                        "dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
                        "dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                      )}
                    >
                      Log in
                    </SheetClose>

                    <SheetClose
                      render={<Link href={ROUTES.login} />}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 py-3.5",
                        primaryBtn,
                        "h-auto",
                      )}
                    >
                      Get started
                      <ArrowRight className="h-[18px] w-[18px]" />
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}