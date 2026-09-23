"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";

const links = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/job-board" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const EMPLOYER_HREF = "/employer/login";

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="JobTrail home"
    >
      <span className="relative h-10 w-10" aria-hidden="true">
        <img src="/logo.png" alt="" className="rounded-lg" />
      </span>
      <span className="text-[25px] font-semibold tracking-[-1.5px] text-[#0f2a5f]">
        JobTrail
      </span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isAuthed = !!user;
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5eaf2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden h-full items-center gap-10 text-sm font-medium text-[#0f2a5f] lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`flex h-full items-center border-b-2 px-1 transition ${
                isActive(link.href)
                  ? "border-[#2563eb] font-semibold text-[#2563eb]"
                  : "border-transparent hover:text-[#2563eb]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href={EMPLOYER_HREF}
            className="text-sm font-medium text-[#64748b] transition hover:text-[#2563eb]"
          >
            For Employers
          </Link>
          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100" />
          ) : isAuthed ? (
            <Link
              href="/jobseeker"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_12px_rgba(37,99,235,.25)] transition hover:from-blue-700 hover:to-indigo-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/account"
                className="text-sm font-medium text-[#0f2a5f] hover:text-[#2563eb]"
              >
                Sign in
              </Link>
              <Link
                href="/account"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_12px_rgba(37,99,235,.2)] transition hover:from-blue-700 hover:to-indigo-700"
              >
                Get started <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:hidden">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : isAuthed ? (
            <Link
              href="/jobseeker"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white sm:px-4"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/account"
                className="hidden text-sm font-medium text-[#0f2a5f] min-[420px]:block"
              >
                Sign in
              </Link>
              <Link
                href="/account"
                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white sm:px-4"
              >
                Get started
              </Link>
            </>
          )}
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg p-2 text-[#0f2a5f]"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#0f2a5f]/20 lg:hidden"
          onClick={closeMenu}
        >
          <aside
            className="ml-auto min-h-full w-full max-w-sm bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                aria-label="Close menu"
                onClick={closeMenu}
                className="p-2"
              >
                <X />
              </button>
            </div>
            <nav className="mt-9 grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-3 py-3 font-medium ${
                    isActive(link.href)
                      ? "bg-[#eff5ff] text-[#2563eb]"
                      : "hover:bg-[#f8faff]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={EMPLOYER_HREF}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 font-medium text-[#64748b] hover:bg-[#f8faff]"
              >
                For Employers
              </Link>
            </nav>
            <div className="mt-8 grid gap-3 border-t border-[#e5eaf2] pt-6">
              {isAuthed ? (
                <Link
                  href="/jobseeker"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-center font-medium text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="rounded-lg border border-[#b8d0ff] py-3 text-center font-medium text-[#2563eb]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-center font-medium text-white"
                  >
                    Get started →
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
