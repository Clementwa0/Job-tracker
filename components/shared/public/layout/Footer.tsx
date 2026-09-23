import Link from "next/link";

const links = [
  { label: "Jobs", href: "/job-board" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "For Employers", href: "/employer/login" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground">
                <img src="/logo.png" alt="" width={32} height={32} />
              </div>
              <span className="text-base font-semibold">JobTrail</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              The calm, organized way to manage your job search — from first
              application to signed offer.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-4 text-[11px] text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} JobTrail. All rights reserved.</p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
