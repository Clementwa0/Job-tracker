"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FileText,
  HelpCircle,
  LayoutGrid,
  ListFilter,
  LogOut,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/public/layout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { PublicJobListItem } from "@/types/jobPosting";
import { publicJobBoardService } from "../../job-board/services/publicJobBoard.client";
import { cn } from "@/lib/utils";

const audiences = ["Startups", "Growing teams", "Enterprises", "Remote-first"];

/* ------------------------------ Dummy data ------------------------------ */

const STATS = [
  { label: "Applications", value: "24", delta: "+6 this week", tone: "blue" as const },
  { label: "Interviews", value: "5", delta: "2 upcoming", tone: "emerald" as const },
  { label: "Responses", value: "11", delta: "46% reply rate", tone: "purple" as const },
  { label: "Offers", value: "2", delta: "1 pending", tone: "amber" as const },
];

const UPCOMING = [
  { title: "Product Designer", company: "Aurora Labs", when: "Tomorrow · 10:00 AM", tone: "purple" as const },
  { title: "UX Researcher", company: "Lumen Studios", when: "Fri · 2:30 PM", tone: "blue" as const },
];

const RECENT = [
  { title: "Senior Product Designer", company: "Nimbus Robotics", status: "Interview", tone: "purple" as const, when: "2h ago" },
  { title: "Data Engineer", company: "Cedarwood Health", status: "Applied", tone: "blue" as const, when: "1d ago" },
  { title: "UX Designer", company: "Lumen Studios", status: "Offer", tone: "emerald" as const, when: "3d ago" },
];

export default function LandingPreview() {
  const [jobs, setJobs] = useState<PublicJobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await publicJobBoardService.list({ sort: "newest" });
        if (!cancelled) setJobs(result.jobs.slice(0, 3));
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Audience strip */}
      <SectionWrapper
        className="border-y border-blue-100/50 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30"
        containerClassName="max-w-[1665px] px-4 sm:px-6 xl:px-0"
        spacingClassName="py-4"
      >
        <p className="text-[13px] font-semibold text-[#10192d]">
          Built for modern employers &amp; job seekers
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {audiences.map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-blue-100 bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-[#425066]"
            >
              {label}
            </Badge>
          ))}
        </div>
      </SectionWrapper>

      {/* Main grid */}
      <SectionWrapper
        className="bg-gradient-to-br from-[#f8faff] to-[#f0f4ff]"
        containerClassName="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-[380px_1fr] lg:gap-5 lg:px-8 xl:px-10"
        spacingClassName="py-6"
      >
        <div className="space-y-4">
          <Highlights />
          <Jobs jobs={jobs} loading={jobsLoading} />
        </div>
        <Dashboard />
      </SectionWrapper>
    </>
  );
}

/* ------------------------------- Highlights ------------------------------- */

function Highlights() {
  const items: {
    Icon: LucideIcon;
    title: string;
    desc: string;
    gradient: string;
  }[] = [
    { Icon: Compass, title: "Personalized matches", desc: "Jobs picked for your skills", gradient: "from-blue-500 to-indigo-500" },
    { Icon: BriefcaseBusiness, title: "Curated job board", desc: "Roles worth applying to", gradient: "from-emerald-500 to-teal-500" },
    { Icon: ClipboardCheck, title: "Application tracking", desc: "Every stage, in one place", gradient: "from-purple-500 to-pink-500" },
    { Icon: BarChart3, title: "Career insights", desc: "Understand your progress", gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <Card className="h-fit overflow-hidden border-blue-100/60 py-0 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2.5">
        <CardTitle className="text-[13px] font-bold text-[#0f1830]">
          What you get
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`flex items-center gap-3 px-4 py-3
                ${i % 2 ? "sm:border-l sm:border-blue-50/50" : ""}
                ${i > 0 ? "border-t border-blue-50/50 sm:border-t-0" : ""}
                ${i > 1 ? "sm:border-t sm:border-blue-50/50" : ""}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-white`}>
                <item.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <b className="block truncate text-[13px] font-semibold text-[#0f1830]">
                  {item.title}
                </b>
                <small className="block truncate text-[11px] text-slate-500">
                  {item.desc}
                </small>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- Jobs ---------------------------------- */

function Jobs({
  jobs,
  loading,
}: {
  jobs: PublicJobListItem[];
  loading: boolean;
}) {
  return (
    <Card className="relative h-fit overflow-hidden border-blue-100/60 py-0 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <CardHeader className="flex-row items-center justify-between border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2.5">
        <CardTitle className="text-[13px] font-bold text-[#0f1830]">
          Featured jobs
        </CardTitle>
        <Button variant="link" className="h-auto p-0 text-[11px] font-semibold text-[#1668df]">
          <Link href="/job-board">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="divide-y divide-blue-50/50">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[12px] text-slate-500">No live jobs yet.</p>
            <Button variant="link" className="mt-1 h-auto p-0 text-[12px] font-semibold text-[#1668df]">
              <Link href="/job-board">Browse job board</Link>
            </Button>
          </div>
        ) : (
          jobs.map((job) => <JobRow key={job.id} job={job} />)
        )}
      </CardContent>
    </Card>
  );
}

function JobRow({ job }: { job: PublicJobListItem }) {
  const companyName = job.company?.name ?? "Company";
  const letter = (companyName[0] ?? job.title?.[0] ?? "?").toUpperCase();
  const meta = [companyName, job.location, job.workMode].filter(Boolean).join(" · ");
  const salary = formatSalary(job);
  const time = formatRelativeTime(job.publishedAt);

  return (
    <Link
      href={`/job-board/${job.slug}`}
      className="flex min-w-0 items-center gap-3 border-b border-blue-50/50 px-4 py-3 last:border-0 transition-colors hover:bg-blue-50/30"
    >
      <Avatar className="h-9 w-9 rounded-lg bg-slate-50">
        <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-[14px] font-bold text-white">
          {letter}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-semibold text-[#111a31]">
          {job.title}
        </b>
        <p className="truncate text-[11px] text-slate-500">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        {salary && (
          <b className="block text-[12px] font-semibold text-emerald-600">{salary}</b>
        )}
        <small className="text-[10px] text-slate-400">{time}</small>
      </div>
    </Link>
  );
}

/* -------------------------------- Dashboard ------------------------------- */

function Dashboard() {
  return (
    <Card className="h-fit overflow-hidden border-blue-100/60 py-0 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <div className="flex">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 space-y-3 p-3 sm:p-4 lg:p-5">
          {/* Stat cards with dummy figures */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                icon={
                  stat.label === "Applications" ? (
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                  ) : stat.label === "Interviews" ? (
                    <ClipboardCheck className="h-3.5 w-3.5" />
                  ) : stat.label === "Responses" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )
                }
                label={stat.label}
                value={stat.value}
                delta={stat.delta}
                tone={stat.tone}
              />
            ))}
          </div>

          {/* Today's Focus + Upcoming Interviews */}
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <TodayFocus />
            <UpcomingInterviews />
          </div>

          {/* Quick Actions + Recent Applications */}
          <div className="grid gap-3 lg:grid-cols-2">
            <QuickActions />
            <RecentApplications />
          </div>
        </div>
      </div>
    </Card>
  );
}

function DashboardSidebar() {
  const workspace = [
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Dashboard", active: true },
    { icon: <BriefcaseBusiness className="h-3.5 w-3.5" />, label: "Applications", badge: "24" },
    { icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Interviews", badge: "5" },
    { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Calendar" },
    { icon: <FileText className="h-3.5 w-3.5" />, label: "Resumes" },
    { icon: <FileCheck2 className="h-3.5 w-3.5" />, label: "CV Review" },
    { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Analytics" },
  ];

  const discover = [{ icon: <Search className="h-3.5 w-3.5" />, label: "Browse Jobs" }];

  const account = [
    { icon: <Settings2 className="h-3.5 w-3.5" />, label: "Settings" },
    { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "Help & Support" },
  ];

  return (
    <aside className="hidden w-[170px] shrink-0 flex-col border-r border-blue-50 bg-white sm:flex lg:w-[190px]">
      <div className="flex items-center gap-2 border-b border-blue-50 px-3 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <b className="block text-[12px] font-bold leading-none text-[#0f1830]">
            JobTrail
          </b>
          <span className="mt-0.5 block text-[9px] leading-none text-slate-500">
            Job application tracker
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-2.5">
        <SidebarGroup label="WORKSPACE" items={workspace} />
        <SidebarGroup label="DISCOVER" items={discover} />
        <SidebarGroup label="ACCOUNT" items={account} />
      </nav>

      <div className="flex items-center gap-2 border-t border-blue-50 px-2.5 py-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-[10px] font-bold text-white">
          CW
        </span>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[10.5px] font-semibold leading-tight text-[#0f1830]">
            Clement Wambua
          </b>
          <span className="block text-[9px] leading-tight text-slate-500">
            Job Seeker
          </span>
        </div>
        <LogOut className="h-3 w-3 shrink-0 text-slate-400" />
      </div>
    </aside>
  );
}

function SidebarGroup({
  label,
  items,
}: {
  label: string;
  items: { icon: React.ReactNode; label: string; active?: boolean; badge?: string }[];
}) {
  return (
    <div>
      <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.label}>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition",
                item.active
                  ? "bg-blue-50 text-[#1668df]"
                  : "text-slate-600 hover:bg-blue-50/50 hover:text-[#1668df]",
              )}
            >
              <span className={item.active ? "text-[#1668df]" : "text-slate-400"}>
                {item.icon}
              </span>
              <span className="truncate flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0 text-[9px] font-semibold text-slate-600">
                  {item.badge}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ Dashboard cards --------------------------- */

function StatCard({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  tone: "blue" | "emerald" | "purple" | "amber";
}) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-lg border border-blue-100/60 bg-white p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${toneMap[tone]}`}>
          {icon}
        </span>
        <span className="truncate text-[10.5px] font-medium text-slate-500">
          {label}
        </span>
      </div>
      <b className="mt-1.5 block text-lg font-bold text-[#0f1830]">{value}</b>
      <p className="mt-0.5 text-[9.5px] text-slate-500">{delta}</p>
    </div>
  );
}

function TodayFocus() {
  const tasks = [
    {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      tone: "emerald" as const,
      title: "3 new matching jobs",
      action: "View Jobs",
    },
    {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      tone: "amber" as const,
      title: "Polish your CV",
      action: "Build CV",
    },
  ];

  return (
    <Card className="h-fit rounded-xl border border-blue-100/60 py-0 shadow-[0_4px_14px_rgba(37,99,235,0.05)]">
      <CardHeader className="flex-row items-center justify-between px-3 py-2.5">
        <CardTitle className="text-[12px] font-bold text-[#0f1830]">
          Today&apos;s Focus
        </CardTitle>
        <Button variant="link" className="h-auto p-0 text-[10px] font-semibold text-[#1668df]">
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tasks.map((task) => (
            <div
              key={task.title}
              className="flex items-center gap-2.5 rounded-lg border border-blue-100/60 bg-white p-2.5"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                task.tone === "emerald"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}>
                {task.icon}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[11px] font-semibold text-[#0f1830]">
                  {task.title}
                </b>
                <Button
                  size="sm"
                  className="mt-1 h-6 rounded-md bg-blue-600 px-2 text-[10px] font-medium text-white hover:bg-blue-700"
                >
                  {task.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingInterviews() {
  return (
    <Card className="h-fit rounded-xl border border-blue-100/60 py-0 shadow-[0_4px_14px_rgba(37,99,235,0.05)]">
      <CardHeader className="flex-row items-center justify-between px-3 py-2.5">
        <CardTitle className="text-[12px] font-bold text-[#0f1830]">
          Upcoming Interviews
        </CardTitle>
        <Button variant="link" className="h-auto p-0 text-[10px] font-semibold text-[#1668df]">
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <ul className="space-y-1.5">
          {UPCOMING.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-2.5 rounded-lg border border-blue-100/60 bg-white p-2"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                item.tone === "purple"
                  ? "bg-purple-50 text-purple-600"
                  : "bg-blue-50 text-blue-600"
              }`}>
                <CalendarDays className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[11px] font-semibold text-[#0f1830]">
                  {item.title}
                </b>
                <p className="truncate text-[10px] text-slate-500">
                  {item.company} · {item.when}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { icon: <Search className="h-3.5 w-3.5" />, label: "Browse jobs" },
    { icon: <ListFilter className="h-3.5 w-3.5" />, label: "View filters" },
    { icon: <FileText className="h-3.5 w-3.5" />, label: "Upload CV" },
    { icon: <UserRound className="h-3.5 w-3.5" />, label: "Update profile" },
  ];

  return (
    <Card className="h-fit rounded-xl border border-blue-100/60 py-0 shadow-[0_4px_14px_rgba(37,99,235,0.05)]">
      <CardHeader className="px-3 py-2.5">
        <CardTitle className="text-[12px] font-bold text-[#0f1830]">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {actions.map(({ icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-blue-100/60 bg-white px-1.5 py-2 text-center transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                {icon}
              </span>
              <span className="text-[9.5px] font-medium leading-tight text-slate-600">
                {label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentApplications() {
  return (
    <Card className="h-fit rounded-xl border border-blue-100/60 py-0 shadow-[0_4px_14px_rgba(37,99,235,0.05)]">
      <CardHeader className="flex-row items-center justify-between px-3 py-2.5">
        <CardTitle className="text-[12px] font-bold text-[#0f1830]">
          Recent Applications
        </CardTitle>
        <Button variant="link" className="h-auto p-0 text-[10px] font-semibold text-[#1668df]">
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <ul className="space-y-1.5">
          {RECENT.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-2.5 rounded-lg border border-blue-100/60 bg-white p-2"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                item.tone === "purple"
                  ? "bg-purple-50 text-purple-600"
                  : item.tone === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-50 text-blue-600"
              }`}>
                {item.title[0]}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[11px] font-semibold text-[#0f1830]">
                  {item.title}
                </b>
                <p className="truncate text-[10px] text-slate-500">
                  {item.company} · {item.when}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                item.tone === "purple"
                  ? "bg-purple-50 text-purple-700"
                  : item.tone === "emerald"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
              }`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- helpers -------------------------------- */

function formatSalary(job: PublicJobListItem): string | null {
  const min = job.salaryMin ?? null;
  const max = job.salaryMax ?? null;
  const currency = job.salaryCurrency ?? "USD";
  if (min == null && max == null) return null;
  const sym = currency === "USD" ? "$" : "";
  const fmt = (n: number) => `${Math.round(n / 1000)}K`;
  if (min != null && max != null) return `${sym}${fmt(min)}–${sym}${fmt(max)}`;
  if (min != null) return `${sym}${fmt(min)}+`;
  return `Up to ${sym}${fmt(max!)}`;
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}