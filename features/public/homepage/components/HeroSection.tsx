"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
  Target,
  Trophy,
  UserRoundCheck,
} from "lucide-react";

import { SectionWrapper } from "@/components/shared/public/layout";
import { milestones } from ".";
import Benefit from "./Jobcard";

export default function HeroSection() {
  return (
    <SectionWrapper
      id="product"
      className="relative overflow-hidden bg-background"
      containerClassName="relative px-5 sm:px-6 lg:px-8 xl:px-0"
      spacingClassName="py-12 sm:py-16 lg:py-20 xl:py-24"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-primary/[0.05] blur-3xl" />

        <div className="absolute right-[8%] top-[8%] h-96 w-96 rounded-full bg-violet-500/[0.045] blur-3xl" />

        <div className="absolute bottom-0 right-[25%] h-64 w-64 rounded-full bg-blue-400/[0.035] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 xl:gap-16">
        {/* =====================================================
            LEFT — HERO CONTENT
        ===================================================== */}

        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-2 text-[12px] font-medium text-primary shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3 w-3 fill-current" />
            </span>

            <span>Your career. One clear path.</span>
          </div>

          {/* Heading */}
          <h1 className="max-w-[680px] text-[2.65rem] font-semibold leading-[0.98] tracking-[-2.6px] text-foreground sm:text-5xl md:text-[4.2rem] lg:text-[4.35rem] xl:text-[4.7rem]">
            Your career
            <br />
            has a{" "}
            <span className="relative inline-block text-primary">
              path
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-primary/10"
              />
            </span>
            <span className="text-primary">.</span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[540px] text-[15px] leading-7 text-muted-foreground sm:text-base">
            Find opportunities that fit your goals, build a stronger career
            profile, track every application, and know what to do next.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 min-[440px]:flex-row">
            <Link
              href="/job-board"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_8px_30px_rgba(59,130,246,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_34px_rgba(59,130,246,0.24)]"
            >
              <Search className="h-4 w-4" />

              Find jobs

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/account"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 text-[14px] font-semibold text-foreground backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted/60"
            >
              Get started

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-9 grid max-w-[600px] grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Benefit
              icon={<UserRoundCheck />}
              title="Personalized"
              sub="Jobs matched to you"
            />

            <Benefit
              icon={<Trophy />}
              title="Stay organized"
              sub="Track every application"
            />

            <Benefit
              icon={<CheckCircle2 />}
              title="Move forward"
              sub="Know your next step"
            />
          </div>
        </div>

        {/* =====================================================
            RIGHT — CLEAN CAREER VISUAL
        ===================================================== */}

        <div className="relative">
          {/* Soft decorative grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 rounded-[3rem] opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border) / 0.28) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.28) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage:
                "radial-gradient(ellipse at center, black 15%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 15%, transparent 72%)",
            }}
          />

          {/* Main visual */}
          <div className="relative mx-auto w-full max-w-[650px]">
            {/* =================================================
                CAREER MILESTONES
            ================================================= */}

            <div className="relative mt-5 rounded-[1.5rem] border border-border/60 bg-card/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Career path
                  </div>

                  <div className="mt-1 text-[14px] font-semibold text-foreground">
                    Your next moves
                  </div>
                </div>

                <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-semibold text-primary">
                  {milestones.length} steps
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div
                  aria-hidden="true"
                  className="absolute left-[13px] top-3 bottom-3 w-px bg-border"
                />

                <div className="space-y-3">
                  {milestones.map((item, index) => {
                    const isLast = index === milestones.length - 1;

                    return (
                      <div
                        key={item.n}
                        className="group relative flex gap-3"
                      >
                        {/* Number */}
                        <div
                          className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm ring-4 ring-card"
                          style={{
                            backgroundColor: item.color,
                          }}
                        >
                          {item.n}
                        </div>

                        {/* Content */}
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-colors group-hover:border-border/60 group-hover:bg-background/60">
                          <div className="min-w-0">
                            <div
                              className="text-[10px] font-semibold sm:text-[11px]"
                              style={{
                                color: item.color,
                              }}
                            >
                              {item.title}
                            </div>

                            <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">
                              {item.text}
                            </p>
                          </div>

                          {!isLast && (
                            <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/40 sm:block" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-primary [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
        </span>

        <span className="text-[9px]">
          {label}
        </span>
      </div>

      <div className="mt-1.5 text-[17px] font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}