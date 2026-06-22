import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { navItems } from "@/constants";
import { useAuth } from "@/hooks/AuthContext";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [active, setActive] = useState("features");

  useEffect(() => {
    const sections = ["features", "how", "pricing"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link
        to="/jobs"
        className="relative text-sm font-medium text-foreground transition hover:text-primary"
        onClick={onNavigate}
      >
        Browse Jobs
      </Link>
      <Link
        to="/employer/login"
        className="relative text-sm font-medium text-muted-foreground transition hover:text-primary"
        onClick={onNavigate}
      >
        For Employers
      </Link>
      <Link
        to="/admin/login"
        className="relative text-sm font-medium text-muted-foreground transition hover:text-primary"
        onClick={onNavigate}
      >
        Admin
      </Link>
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`relative text-sm transition ${
            active === item.id
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          }`}
          onClick={onNavigate}
        >
          {item.label}

          <span
            className={`absolute left-0 -bottom-1 h-[2px] bg-primary transition-all duration-300 ${
              active === item.id ? "w-full" : "w-0"
            }`}
          />
        </a>
      ))}
    </>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="JobTrail logo"
              width={scrolled ? 32 : 40}
              height={scrolled ? 32 : 40}
              className="rounded-full transition-all duration-300"
            />
            <span className="font-semibold text-foreground hidden sm:block">
              JobTrail
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild
                  variant="ghost"
                  size="sm"
                  className="hidden border sm:inline-flex text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login">
                  Sign in
                  </Link>
                </Button>

                <Button
                asChild
                  size="sm"
                  className="text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/register">
                  Get started
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-background border-l border-border p-6 transform transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>

          <div className="mt-8 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button asChild className="w-full">
                <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register" onClick={() => setOpen(false)}>Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
