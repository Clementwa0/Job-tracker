import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Lightbulb,
  Plus,
  Smile,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Applied", value: 29, icon: Briefcase, tone: "primary" },
  { label: "Interviews", value: 7, icon: CalendarDays, tone: "mint" },
  { label: "Offers", value: 2, icon: CheckCircle2, tone: "good" },
  { label: "Response rate", value: "34%", icon: TrendingUp, tone: "warn" },
];

const recent = [
  { co: "Linear", role: "Senior Product Designer", stage: "Interview", time: "2d" },
  { co: "Vercel", role: "Frontend Engineer", stage: "Applied", time: "5d" },
  { co: "Stripe", role: "Design Engineer", stage: "Offer", time: "1d" },
  { co: "Notion", role: "Product Engineer", stage: "Applied", time: "6d" },
];

const interviews = [
  { co: "Linear", role: "Design round", when: "Tomorrow · 10:00" },
  { co: "Stripe", role: "Final · Hiring mgr", when: "Fri · 14:30" },
];

const toneClass = (tone: string) =>
  tone === "mint"
    ? "text-[color:var(--accent-mint)] bg-[color:var(--accent-mint)]/10"
    : tone === "good"
      ? "text-[color:var(--accent-mint)] bg-[color:var(--accent-mint)]/10"
      : tone === "warn"
        ? "text-[color:var(--chart-4)] bg-[color:var(--chart-4)]/10"
        : "text-primary bg-primary/10";

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="absolute inset-0 -z-10 bg-gradient-mesh blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-destructive/60" />
          <span className="h-3 w-3 rounded-full bg-[color:var(--chart-4)]/70" />
          <span className="h-3 w-3 rounded-full bg-[color:var(--accent-mint)]" />
          <span className="ml-3 text-xs text-muted-foreground">jobtrail.app / dashboard</span>
        </div>

        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Track your job search progress and stay organized.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-elegant">
              <Plus className="h-3.5 w-3.5" />
              Add New Job
            </button>
          </div>

          {/* Mood */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--accent-mint)]/15 text-[color:var(--accent-mint)]">
                <Smile className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Feeling optimistic today</div>
                <div className="text-xs text-muted-foreground">Log your mood to spot patterns.</div>
              </div>
            </div>
          </div>

          {/* Overview / Stats */}
          <div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold">Overview</h4>
              <p className="text-xs text-muted-foreground">
                Your job search performance at a glance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div
                    className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md ${toneClass(s.tone)}`}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent applications - 2 cols */}
            <div className="rounded-xl border border-border bg-background lg:col-span-2">
              <div className="border-b border-border px-4 py-3">
                <div className="text-sm font-semibold">Recent Applications</div>
                <div className="text-xs text-muted-foreground">Latest job activity updates</div>
              </div>
              <ul className="divide-y divide-border">
                {recent.map((j) => (
                  <li key={j.co} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {j.co[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{j.role}</div>
                        <div className="text-xs text-muted-foreground">{j.co}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                        {j.stage}
                      </span>
                      <span className="text-xs text-muted-foreground">{j.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background">
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Upcoming Interviews
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Don't miss your scheduled interviews
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {interviews.map((i) => (
                    <li key={i.co} className="px-4 py-3">
                      <div className="text-sm font-medium">{i.co}</div>
                      <div className="text-xs text-muted-foreground">{i.role}</div>
                      <div className="mt-1 text-xs font-medium text-primary">{i.when}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-gradient-to-br from-[color:var(--accent-mint)]/10 to-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-[color:var(--accent-mint)]" />
                  Tip of the Day
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Follow up within 48 hours after an interview — candidates who do are 27% more
                  likely to hear back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
