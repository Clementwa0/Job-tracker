import Link from "next/link";
import {
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  Quote,
  Send,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/public/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const path: Array<{
  step: number;
  title: string;
  copy: string;
  Icon: LucideIcon;
  tone: string;
}> = [
  {
    step: 1,
    title: "Discover",
    copy: "Uncover opportunities that match your skills, interests, and goals.",
    Icon: Compass,
    tone: "bg-[#2563eb]",
  },
  {
    step: 2,
    title: "Apply",
    copy: "Apply with confidence using AI-powered tools that highlight your best fit.",
    Icon: FileCheck2,
    tone: "bg-[#6d45dd]",
  },
  {
    step: 3,
    title: "Grow",
    copy: "Build in-demand skills and track your progress with personalized insights.",
    Icon: TrendingUp,
    tone: "bg-[#2563eb]",
  },
  {
    step: 4,
    title: "Move Forward",
    copy: "Take the next step toward your goals and keep moving your career ahead.",
    Icon: Send,
    tone: "bg-[#6d45dd]",
  },
];

const howItWorks = [
  "Create your profile in minutes",
  "Get matched with relevant opportunities",
  "Apply smarter with AI-powered tools",
  "Track applications and get insights",
];

const highlights: Array<{ title: string; copy: string; Icon: LucideIcon }> = [
  {
    title: "Personalized matching",
    copy: "Roles surfaced around your skills and goals.",
    Icon: Users,
  },
  {
    title: "A growing job board",
    copy: "New opportunities added on an ongoing basis.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Built for both sides",
    copy: "One platform for job seekers and employers.",
    Icon: Building2,
  },
  {
    title: "Career insights",
    copy: "Track progress and plan your next move.",
    Icon: TrendingUp,
  },
];

const values: Array<{ title: string; copy: string; Icon: LucideIcon }> = [
  {
    title: "People First",
    copy: "We build with empathy and put our users at the center of every decision.",
    Icon: UsersRound,
  },
  {
    title: "Data Driven",
    copy: "We use data and AI to unlock insights that lead to better career outcomes.",
    Icon: BadgeCheck,
  },
  {
    title: "Always Improving",
    copy: "We iterate, learn, and evolve to stay ahead of the changing world of work.",
    Icon: Settings2,
  },
  {
    title: "Stronger Together",
    copy: "We collaborate openly and celebrate diverse perspectives and backgrounds.",
    Icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071632]">
      <main>
        {/* Hero Section */}
        <SectionWrapper
          className="border-b border-slate-100 bg-white"
          containerClassName="grid max-w-[1400px] items-center gap-10 lg:grid-cols-[.95fr_1.05fr] lg:px-0"
          spacingClassName="py-10 lg:py-12"
        >
          <div className="max-w-[520px]">
            <Badge className="rounded-full bg-[#f1f0ff] px-3 py-1 text-xs font-medium text-[#5b43c8] hover:bg-[#f1f0ff]">
              About JobTrail
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-1.2px] text-[#061337] md:text-5xl">
              Your career
              <br />
              has a path<span className="text-[#2563eb]">.</span>
            </h1>
            <p className="mt-4 max-w-[480px] text-[14px] leading-6 text-slate-600">
              JobTrail exists to make careers clearer and opportunities closer.
              We combine intelligent technology with human insight to help you
              discover the right opportunities, take action with confidence, and
              keep growing.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                size="lg"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-[#1d55d1] sm:w-auto"
              >
                <Link href="/account">Join JobTrail</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-lg border-slate-200 px-5 py-3 text-sm font-medium text-[#155fce] hover:border-[#2563eb] sm:w-auto"
              >
                <Link href="/job-board">Explore Careers</Link>
              </Button>
            </div>
          </div>

          <JobTrailPath />
        </SectionWrapper>

        {/* Mission / How it works / Career intelligence / Mission quote */}
        <SectionWrapper
          containerClassName="mx-auto max-w-[1400px] lg:px-0"
          spacingClassName="py-12"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Target className="h-5 w-5" />}
              title="Our Mission"
              copy="To empower every professional to find purpose, achieve growth, and create impact through the right career opportunities."
            />
            <Card className="rounded-xl border-slate-200 p-0 shadow-[0_2px_8px_rgba(15,23,42,.035)]">
              <CardContent className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5faf4] text-[#12b981]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold">
                  How JobTrail Works
                </h2>
                <ul className="mt-2.5 grid gap-1.5">
                  {howItWorks.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[13px] leading-5 text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#12b981]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Feature
              icon={<Brain className="h-5 w-5" />}
              title="Career Intelligence"
              copy="Our AI looks at your skills, experience, and goals to surface personalized recommendations and skill insights-so you can make smarter career decisions."
            />
            <MissionQuote />
          </div>
        </SectionWrapper>

        {/* Platform highlights */}
        <SectionWrapper
          className="border-y border-slate-200 bg-white"
          containerClassName="mx-auto max-w-[1400px] lg:px-0"
          spacingClassName="py-6"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, copy, Icon }, index) => (
              <div
                className={`flex items-center gap-3 border-slate-100 lg:pr-4 ${
                  index < highlights.length - 1 ? "lg:border-r" : ""
                }`}
                key={title}
              >
                <span className="shrink-0 rounded-lg bg-[#eff5ff] p-2.5 text-[#2563eb]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <b className="block text-[13px] text-[#0a1b42]">{title}</b>
                  <small className="text-[11px] text-slate-500">{copy}</small>
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* The people behind JobTrail */}
        <SectionWrapper
          containerClassName="mx-auto max-w-[1400px] lg:px-0"
          spacingClassName="py-12"
        >
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.5px]">
                The People Behind JobTrail
              </h2>
              <p className="mt-3 max-w-[380px] text-sm leading-6 text-slate-600">
                We&apos;re a team of technologists, data scientists, product
                thinkers, and career advocates building the future of
                work-together.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {values.map(({ title, copy, Icon }) => (
                <div key={title}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff5ff] text-[#2563eb]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-600">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </main>
    </div>
  );
}

function JobTrailPath() {
  return (
    <Card className="rounded-xl border-slate-200 p-0 shadow-[0_4px_14px_rgba(30,64,175,.05)]">
      <CardContent className="p-5">
        <p className="text-center text-sm font-semibold">The JobTrail Path</p>
        <div className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-2">
          <div className="absolute left-[12%] right-[12%] top-5 hidden border-t border-dashed border-[#cfdcff] sm:block" />

          {path.map(({ step, title, Icon, tone }) => (
            <div
              key={title}
              className="relative z-10 flex flex-col items-center"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white ring-4 ring-white ${tone}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                {step}
              </span>
              <b className="mt-1.5 text-[12px]">{title}</b>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-center sm:grid-cols-4">
          {path.map(({ title, copy }) => (
            <p key={title} className="text-[11px] leading-4 text-slate-500">
              {copy}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Feature({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <Card className="rounded-xl border-slate-200 p-0 shadow-[0_2px_8px_rgba(15,23,42,.035)]">
      <CardContent className="p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff5ff] text-[#2563eb]">
          {icon}
        </span>
        <h2 className="mt-4 text-base font-semibold">{title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-slate-600">{copy}</p>
      </CardContent>
    </Card>
  );
}

function MissionQuote() {
  return (
    <Card className="flex flex-col rounded-xl border-none bg-[#f4f0ff] p-0">
      <CardContent className="flex flex-1 flex-col justify-center p-5">
        <Quote className="h-5 w-5 fill-[#6941d7] text-[#6941d7]" />
        <p className="mt-3 text-[13px] leading-5 text-[#33255c]">
          We believe the job search should feel like clarity, not chaos.
        </p>
        <p className="mt-2 text-[11px] font-medium text-[#6941d7]">
          - The JobTrail Team
        </p>
      </CardContent>
    </Card>
  );
}
