export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <img src="./logo.png" alt="logo" width={45} height={45} />
              </div>
              <span className="text-lg font-semibold">Jobtrail</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The calm, organized way to manage your job search - from first application to signed offer.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/jobs" className="hover:text-foreground">Browse Jobs</a></li>
              <li><a href="/employer/login" className="hover:text-foreground">For Employers</a></li>
              <li><a href="/admin/login" className="hover:text-foreground">Admin</a></li>
              <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">Extension</a></li>
              <li><a href="#" className="hover:text-foreground">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Jobtrail. All rights reserved.</p>
          <p>Crafted for job seekers, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
