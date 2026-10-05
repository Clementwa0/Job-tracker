import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Quote,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { SectionWrapper } from "@/components/shared/public/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { howItWorks, highlights, values, path} from ".";


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <SectionWrapper
          className="border-b border-border bg-card"
          containerClassName="grid max-w-[1400px] items-center gap-8 sm:gap-10 lg:grid-cols-[.95fr_1.05fr] lg:px-0"
          spacingClassName="py-8 sm:py-10 lg:py-12"
        >
          <div className="mx-auto w-full max-w-[520px] text-center sm:mx-0 sm:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Your career, with direction
            </div>

            <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-1px] text-foreground sm:text-4xl md:text-5xl md:leading-[1.1] md:tracking-[-1.2px]">
              Your career
              <br />
              has a path<span className="text-primary">.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-[480px] text-sm leading-6 text-muted-foreground sm:mx-0 sm:text-[14px]">
              JobTrail brings job discovery, resume building, job matching, and
              application tracking into one career-focused platform. We help
              you understand where you fit, prepare with confidence, and keep
              moving forward.
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
                className="w-full rounded-lg border-border px-5 py-3 text-sm font-medium text-primary hover:border-primary sm:w-auto"
              >
                <Link href="/job-board">Explore Careers</Link>
              </Button>
            </div>
          </div>

          <div className="w-full">
            <JobTrailPath />
          </div>
        </SectionWrapper>
        
        <SectionWrapper
          containerClassName="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-0"
          spacingClassName="py-10 sm:py-12"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Target className="h-5 w-5" />}
              title="Our Mission"
              copy="To make career decisions clearer by bringing opportunities, preparation, and progress into one focused experience."
            />

            <Card className="rounded-xl border-border p-0 shadow-[0_2px_8px_rgba(15,23,42,.035)]">
              <CardContent className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-5 w-5" />
                </span>

                <h2 className="mt-4 text-base font-semibold">
                  How JobTrail Works
                </h2>

                <ul className="mt-2.5 grid gap-1.5">
                  {howItWorks.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[13px] leading-5 text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Feature
              icon={<Brain className="h-5 w-5" />}
              title="Career Intelligence"
              copy="JobTrail uses AI and structured career data to help you improve your resume, understand job fit, and make better-informed application decisions."
            />

            <MissionQuote />
          </div>
        </SectionWrapper>

        {/* ------------------------------------------------------------------ */}
        {/* Platform highlights                                                */}
        {/* ------------------------------------------------------------------ */}

        <SectionWrapper
          className="border-y border-border bg-card"
          containerClassName="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-0"
          spacingClassName="py-6"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, copy, Icon }, index) => (
              <div
                key={title}
                className={`flex items-center gap-3 border-border lg:pr-4 ${
                  index < highlights.length - 1 ? "lg:border-r" : ""
                }`}
              >
                <span className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </span>

                <span>
                  <b className="block text-[13px] text-foreground">{title}</b>

                  <small className="text-[11px] leading-4 text-muted-foreground">
                    {copy}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* ------------------------------------------------------------------ */}
        {/* What we believe                                                   */}
        {/* ------------------------------------------------------------------ */}

        <SectionWrapper
          containerClassName="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-0"
          spacingClassName="py-10 sm:py-12"
        >
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div className="text-center sm:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Users className="h-3.5 w-3.5" />
                What we believe
              </div>

              <h2 className="text-xl font-semibold tracking-[-0.5px] sm:text-2xl">
                Built around your career journey
              </h2>

              <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-muted-foreground sm:mx-0">
                The job search can be complicated. JobTrail is designed to
                bring the important pieces together so you can spend less time
                managing the process and more time moving your career forward.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {values.map(({ title, copy, Icon }) => (
                <div key={title} className="text-center sm:text-left">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary sm:mx-0">
                    <Icon className="h-4 w-4" />
                  </span>

                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>

                  <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>

       
        <SectionWrapper
          className="border-t border-border bg-card"
          containerClassName="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-0"
          spacingClassName="py-10 sm:py-12"
        >
          <Card className="overflow-hidden rounded-2xl border-border bg-primary text-primary-foreground shadow-none">
            <CardContent className="flex flex-col items-center justify-between gap-6 p-6 text-center sm:p-8 lg:flex-row lg:text-left">
              <div className="max-w-[650px]">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium opacity-90">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start your next step
                </div>

                <h2 className="text-xl font-semibold tracking-[-0.4px] sm:text-2xl">
                  Your next opportunity starts with a clearer path.
                </h2>

                <p className="mt-2 text-sm leading-6 opacity-85">
                  Discover opportunities, strengthen your application, and
                  keep track of your progress with JobTrail.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-lg px-5 sm:w-auto"
                >
                  <Link href="/account">Get Started</Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-lg border-primary-foreground/30 bg-transparent px-5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  <Link href="/job-board">Browse Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </SectionWrapper>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* JobTrail Path                                                              */
/* -------------------------------------------------------------------------- */

function JobTrailPath() {
  return (
    <Card className="rounded-xl border-border p-0 shadow-[0_4px_14px_rgba(30,64,175,.05)]">
      <CardContent className="p-5 sm:p-6">
        <div className="text-center">
          <p className="text-sm font-semibold">The JobTrail Path</p>

          <p className="mx-auto mt-1 max-w-[460px] text-[12px] leading-5 text-muted-foreground">
            From discovering an opportunity to building momentum in your
            career.
          </p>
        </div>

        {/* Mobile: vertical timeline — Desktop: horizontal steps */}
        <div className="relative mt-6">
          {/* Mobile vertical line */}
          <div className="absolute bottom-2 left-5 top-2 w-px border-l border-dashed border-border sm:hidden" />

          {/* Desktop horizontal line */}
          <div className="absolute left-[12%] right-[12%] top-5 hidden border-t border-dashed border-border sm:block" />

          <div className="grid gap-5 sm:grid-cols-4 sm:gap-2">
            {path.map(({ step, title, copy, Icon, tone }) => (
              <div
                key={title}
                className="relative z-10 flex items-start gap-4 sm:flex-col sm:items-center sm:gap-0"
              >
                {/* Icon + step number */}
                <div className="relative flex shrink-0 flex-col items-center">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-white ring-4 ring-background ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                    {step}
                  </span>
                </div>

                {/* Title + copy */}
                <div className="min-w-0 flex-1 pt-0.5 sm:mt-1.5 sm:flex-none sm:pt-0 sm:text-center">
                  <b className="block text-[13px] font-semibold sm:text-[12px]">
                    {title}
                  </b>

                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground sm:mt-1 sm:text-[11px] sm:leading-4">
                    {copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Feature Card                                                               */
/* -------------------------------------------------------------------------- */

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
    <Card className="rounded-xl border-border p-0 shadow-[0_2px_8px_rgba(15,23,42,.035)]">
      <CardContent className="p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>

        <h2 className="mt-4 text-base font-semibold">{title}</h2>

        <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
          {copy}
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Mission Quote                                                              */
/* -------------------------------------------------------------------------- */

function MissionQuote() {
  return (
    <Card className="flex flex-col rounded-xl border-none bg-accent p-0">
      <CardContent className="flex flex-1 flex-col justify-center p-5">
        <Quote className="h-5 w-5 fill-accent-foreground text-accent-foreground" />

        <p className="mt-3 text-[13px] leading-5 text-accent-foreground">
          We believe the job search should feel like clarity, not chaos.
        </p>

        <p className="mt-2 text-[11px] font-medium text-accent-foreground">
          — The JobTrail Team
        </p>
      </CardContent>
    </Card>
  );
}