"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/job-board" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const EMPLOYER_HREF = "/employer/login";
const AUTH_HREF = "/account";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand({ lazy = false }: { lazy?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="JobTrail home"
    >
      <span
        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl sm:h-10 sm:w-10"
        aria-hidden="true"
      >
        <img
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </span>

      <span className="text-[22px] font-bold tracking-[-1.2px] text-foreground transition-colors sm:text-[25px] sm:tracking-[-1.5px]">
        JobTrail
      </span>
    </Link>
  );
}

const ctaBase =
  "bg-brand-gradient text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg";

export default function Nav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => isActivePath(pathname, href);
  const isAuthed = !!user;
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
        {/* Brand */}
        <Brand />

        {/* Desktop navigation */}
        <nav
          className="hidden h-full items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center rounded-xl px-3.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}

                {active && (
                  <span className="absolute inset-x-3 -bottom-[19px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={EMPLOYER_HREF}
            className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            For Employers
          </Link>

          <div className="mx-1 h-6 w-px bg-border" />

          {isLoading ? (
            <div
              className="h-10 w-32 animate-pulse rounded-xl bg-muted"
              aria-hidden
            />
          ) : isAuthed ? (
            <Link
              href="/jobseeker"
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold",
                ctaBase,
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={AUTH_HREF}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                Sign in
              </Link>

              <Link
                href={AUTH_HREF}
                className={cn(
                  "group flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold",
                  ctaBase,
                )}
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:hidden">
          {isLoading ? (
            <div
              className="h-9 w-24 animate-pulse rounded-xl bg-muted"
              aria-hidden
            />
          ) : isAuthed ? (
            <Link
              href="/jobseeker"
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold sm:px-4",
                ctaBase,
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={AUTH_HREF}
                className="hidden rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary min-[420px]:block"
              >
                Sign in
              </Link>

              <Link
                href={AUTH_HREF}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold sm:px-4",
                  ctaBase,
                )}
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
            onClick={() => setOpen(true)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "border border-border bg-card",
              "text-foreground shadow-sm",
              "transition-all duration-200",
              "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
            )}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
          role="presentation"
        >
          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="ml-auto flex min-h-full w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex h-[72px] items-center justify-between border-b border-border px-4 sm:px-6">
              <Brand lazy />

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  "border border-border bg-card text-muted-foreground",
                  "transition-colors",
                  "hover:bg-muted hover:text-foreground",
                )}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Navigation */}
            <nav
              className="flex-1 px-4 py-6 sm:px-6"
              aria-label="Mobile navigation"
            >
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Navigation
              </p>

              <div className="grid gap-1">
                {links.map((link) => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all",
                        active
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}

                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="my-6 h-px bg-border" />

              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Business
              </p>

              <Link
                href={EMPLOYER_HREF}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>For Employers</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>

            {/* Account actions */}
            <div className="border-t border-border bg-card/60 p-4 sm:p-6">
              {isAuthed ? (
                <Link
                  href="/jobseeker"
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3.5 text-center text-sm font-semibold",
                    ctaBase,
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <div className="grid gap-2.5">
                  <Link
                    href={AUTH_HREF}
                    onClick={closeMenu}
                    className="rounded-xl border border-border bg-background py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    Sign in
                  </Link>

                  <Link
                    href={AUTH_HREF}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-center text-sm font-semibold",
                      ctaBase,
                    )}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}