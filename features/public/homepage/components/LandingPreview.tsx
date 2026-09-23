import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Search,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/public/layout";

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Audience segments JobTrail is built for — kept general rather than naming
// specific companies, since no partnership with named brands is established.
const audiences = ["Startups", "Growing teams", "Enterprises", "Remote-first companies"];

// Sample listings used purely to illustrate the job board experience.
const roles = [
  {
    letter: "A",
    title: "Senior Product Designer",
    company: "Aurora Labs",
    salary: "$120K – $160K",
    time: "2h ago",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    letter: "N",
    title: "Product Designer",
    company: "Nimbus Robotics",
    salary: "$110K – $140K",
    time: "5h ago",
    gradient: "from-purple-500 to-fuchsia-500",
  },
  {
    letter: "C",
    title: "Data Engineer",
    company: "Cedarwood Health",
    salary: "$130K – $170K",
    time: "1d ago",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function LandingPreview() {
  return (
    <>
      {/* Built for — compact audience banner (no unverified partner claims) */}
      <SectionWrapper
        className="border-y border-blue-100/50 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30"
        containerClassName="flex max-w-[1665px] flex-wrap items-center gap-3 sm:gap-6 lg:px-0"
        spacingClassName="py-3"
      >
        <p className="w-auto max-w-[240px] flex-1 text-[14px] font-bold leading-[1.35] text-[#10192d]">
          Built for modern employers
          <br />
          and job seekers
        </p>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {audiences.map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-blue-100 bg-white/70 px-3 py-1 text-[12px] font-medium text-[#425066]"
            >
              {label}
            </Badge>
          ))}
        </div>
      </SectionWrapper>

      {/* Main Grid - Vibrant Background & Wider Dashboard */}
      <SectionWrapper
        className="bg-gradient-to-br from-[#f8faff] to-[#f0f4ff]"
        containerClassName="grid max-w-[1665px] gap-4 xl:grid-cols-[300px_380px_1fr] lg:px-0"
        spacingClassName="py-5"
      >
        <Highlights />
        <Jobs />
        <Dashboard />
      </SectionWrapper>
    </>
  );
}

function Highlights() {
  const items: {
    Icon: LucideIcon;
    title: string;
    desc: string;
    gradient: string;
  }[] = [
    {
      Icon: Compass,
      title: "Personalized matches",
      desc: "Jobs picked for your skills",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      Icon: BriefcaseBusiness,
      title: "Curated job board",
      desc: "Roles worth applying to",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      Icon: ClipboardCheck,
      title: "Application tracking",
      desc: "Every stage, in one place",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      Icon: BarChart3,
      title: "Career insights",
      desc: "Understand your progress",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <Card className="overflow-hidden border-blue-100/60 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2.5">
        <CardTitle className="text-[13px] font-bold text-[#0f1830]">What you get</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2">
          {items.map((item, i) => (
            <div
              className={`flex min-h-[95px] items-center gap-3 p-3.5 ${i % 2 ? "border-l" : ""} ${
                i > 1 ? "border-t" : ""
              } border-blue-50/50`}
              key={item.title}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}
              >
                <item.Icon className="h-5 w-5" />
              </span>
              <span>
                <b className="block text-[12.5px] font-bold leading-[1.2] text-[#0f1830]">
                  {item.title}
                </b>
                <small className="block max-w-[100px] text-[10px] font-medium leading-3 text-slate-500">
                  {item.desc}
                </small>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Jobs() {
  return (
    <Card className="relative overflow-hidden border-blue-100/60 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <CardHeader className="flex-row items-center justify-between border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-[13px] font-bold text-[#0f1830]">Featured jobs</CardTitle>
          <Badge variant="outline" className="h-4 border-slate-200 px-1.5 text-[9px] font-medium text-slate-400">
            Sample listings
          </Badge>
        </div>
        <Button variant="link" className="h-auto p-0 text-[10px] font-semibold text-[#1668df]">
          <Link href="/job-board">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="pt-1">
          {roles.map((role) => (
            <div
              className="flex min-w-0 items-center gap-3 border-b border-blue-50/50 px-4 py-3 last:border-0 transition-colors hover:bg-blue-50/30"
              key={role.title}
            >
              <Avatar className="h-9 w-9 rounded-lg bg-slate-50">
                <AvatarFallback
                  className={`rounded-lg bg-gradient-to-br ${role.gradient} text-[15px] font-bold text-white shadow-sm`}
                >
                  {role.letter}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <b className="block text-[13px] font-bold text-[#111a31]">{role.title}</b>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-500">
                  <span>{role.company}</span>
                  <span className="text-blue-500">Remote</span>
                  <span className="text-purple-500">Full-time</span>
                </div>
              </div>
              <div className="text-right">
                <b className="block text-[12px] font-bold text-emerald-600">{role.salary}</b>
                <small className="text-[10px] text-slate-400">{role.time}</small>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  return (
    <Card className="overflow-hidden border-blue-100/60 shadow-[0_8px_30px_rgba(37,99,235,0.06)]">
      <CardHeader className="flex-row items-center gap-2 border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2.5">
        <CardTitle className="text-[13px] font-bold text-[#0f1830]">Your dashboard preview</CardTitle>
        <Badge variant="outline" className="h-4 border-slate-200 px-1.5 text-[9px] font-medium text-slate-400">
          Sample data
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative flex min-h-[230px]">
          {/* Sidebar - Made narrower with vibrant active state */}
          <aside className="flex w-12 flex-col items-center border-r border-blue-50 bg-gradient-to-b from-white to-blue-50/30 py-4 text-[#667185]">
            <span className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Search className="h-3.5 w-3.5" />
            </span>
            {[BriefcaseBusiness, CalendarDays, BarChart3, Settings2].map((Icon, i) => (
              <Icon key={i} className="mb-4 h-3.5 w-3.5 transition-colors hover:text-blue-600" />
            ))}
          </aside>

          {/* Main Dashboard Area */}
          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <b className="text-[14px] font-bold text-[#0f1830]">Good morning, Alex</b>
                <p className="text-[10px] text-slate-500">
                  Here&apos;s what&apos;s happening with your career journey.
                </p>
              </div>
              <Button
                size="sm"
                className="h-7 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-[10px] font-semibold text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-105"
              >
                View full dashboard
              </Button>
            </div>

            <div className="mt-3 grid min-w-0 grid-cols-3 gap-3">
              <MiniCard label="Applications" value="12" sub="↑ this week" color="blue" />
              <MiniCard label="Interviews" value="3" sub="Upcoming this week" color="purple" />
              <MiniCard label="Profile strength" value="90%" sub="Great job!" color="emerald" progress={90} />
            </div>

            <div className="mt-3 grid min-w-0 grid-cols-[1.2fr_.8fr] gap-3">
              <div className="rounded-xl border border-blue-50 bg-gradient-to-br from-white to-blue-50/50 p-3 shadow-sm">
                <b className="text-[11px] font-bold text-[#0f1830]">Recent activity</b>
                <div className="mt-2.5 flex items-center gap-2 text-[10px]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">
                    <b className="block font-semibold text-[#111a31]">Interview scheduled</b>
                    <span className="text-slate-500">UX Designer · Lumen Studios</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <div className="rounded-xl border border-blue-50 bg-gradient-to-br from-white to-purple-50/30 p-3 shadow-sm">
                <b className="text-[11px] font-bold text-[#0f1830]">Next up</b>
                <div className="mt-2.5 text-[10px]">
                  <b className="block font-semibold text-[#111a31]">Prepare for your interview</b>
                  <span className="mt-0.5 block text-slate-500">
                    Review company insights and common questions.
                  </span>
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-blue-600">
                    <TrendingUp className="h-3 w-3" /> Read guide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniCard({
  label,
  value,
  sub,
  color,
  progress,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "purple" | "emerald";
  progress?: number;
}) {
  const colorMap = {
    blue: "border-blue-100 bg-blue-50/30 text-blue-600",
    purple: "border-purple-100 bg-purple-50/30 text-purple-600",
    emerald: "border-emerald-100 bg-emerald-50/30 text-emerald-600",
  };

  return (
    <Card className={`rounded-xl border p-3 shadow-sm ${colorMap[color]}`}>
      <small className="block text-[10px] font-medium opacity-80">{label}</small>
      <b className="mt-1 block text-[20px] font-extrabold">{value}</b>
      <small className="text-[9px] font-semibold opacity-90">{sub}</small>
      {typeof progress === "number" && (
        <Progress value={progress} className="mt-1.5" />
      )}
    </Card>
  );
}
