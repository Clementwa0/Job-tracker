"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  Sparkles,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/public/layout";
import { milestones } from ".";
import ProgressCard from "./ProgressCard";
import RecentCard from "./RecentCard";
import Benefit, { JobCard } from "./Jobcard";

// Show a trimmed set of steps on the decorative career path so it reads
// cleanly rather than crowding the hero with every milestone.
const visibleMilestones = [milestones[0], milestones[2], milestones[4]].filter(
  Boolean
);

export default function HeroSection() {
  return (
    <SectionWrapper
      id="product"
      className="overflow-hidden bg-[linear-gradient(118deg,#fff_0%,#fbfcff_54%,#fff_100%)]"
      containerClassName="relative xl:min-h-[420px] lg:px-0"
      spacingClassName="py-10 lg:py-14"
    >
      <div className="relative z-10 max-w-[500px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7ff] bg-[#f2f6ff] px-3 py-1.5 text-[13px] font-medium text-[#1768d9]">
          <Sparkles className="h-3.5 w-3.5 fill-[#1768ee]" />
          Your journey. Our platform. Endless opportunities.
        </div>

        <h1 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-1.6px] text-[#051334] sm:text-4xl md:text-[52px] md:tracking-[-2px]">
          Your career
          <br />
          has a path<span className="text-[#146cf1]">.</span>
        </h1>

        <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-[#657084]">
          Find roles that fit you, track every application, and move your
          career forward with clarity.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/job-board"
            className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[#1768ed] px-5 text-[14px] font-medium text-white shadow-[0_4px_10px_rgba(25,104,238,.22)] transition hover:bg-[#1257c9]"
          >
            <Search className="h-4 w-4" />
            Find jobs
          </Link>
          <Link
            href="/account"
            className="inline-flex h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[14px] font-medium text-[#101b30] shadow-sm transition hover:bg-slate-50"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid max-w-[520px] gap-4 text-[12px] text-[#647084] sm:grid-cols-3 sm:gap-3">
          <Benefit
            icon={<UserRoundCheck />}
            title="Personalized for you"
            sub="Smart job matching"
          />
          <Benefit
            icon={<Trophy />}
            title="Track every step"
            sub="Real-time updates"
          />
          <Benefit
            icon={<CheckCircle2 />}
            title="Plan your future"
            sub="Career insights"
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden max-w-full overflow-hidden xl:block"
      >
        <svg
          viewBox="0 0 1060 430"
          className="absolute left-[37%] top-[90px] h-[340px] w-[850px] max-w-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="path" x1="0" x2="1">
              <stop stopColor="#4f96fa" />
              <stop offset="1" stopColor="#7b4be6" />
            </linearGradient>
          </defs>
          <path
            d="M35 305 C140 230 205 215 285 212 S440 175 500 175 S670 154 735 110 S910 75 1050 70"
            fill="none"
            stroke="url(#path)"
            strokeWidth="3"
          />
          <path
            d="M35 305 C140 230 205 215 285 212 S440 175 500 175 S670 154 735 110 S910 75 1050 70"
            fill="none"
            stroke="#bbd4ff"
            strokeOpacity=".3"
            strokeWidth="10"
          />
        </svg>

        {visibleMilestones.map((item, i) => (
          <div key={item.n} className={`absolute ${item.cls}`}>
            <div className="mb-1 text-[12px] text-[#6e7788]">{item.n}</div>
            <div
              className="text-[14px] font-semibold"
              style={{ color: item.color }}
            >
              {item.title}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] leading-[1.35] text-[#657084]">
              {item.text}
            </div>
            <span className="absolute -bottom-[52px] left-6 flex h-7 w-7 items-center justify-center rounded-full border-[5px] border-white bg-white shadow-[0_2px_10px_rgba(28,74,180,.24)]">
              <span
                className="h-3 w-3 rounded-full border-[3px] border-white"
                style={{ backgroundColor: item.color }}
              />
            </span>
            {i === visibleMilestones.length - 1 && (
              <span className="absolute -bottom-[58px] left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#286ee9] shadow-[0_2px_12px_rgba(70,60,180,.3)]">
                <ArrowRight className="h-4 w-4 -rotate-45" />
              </span>
            )}
          </div>
        ))}

        <JobCard />
        <ProgressCard />
        <RecentCard />
      </div>
    </SectionWrapper>
  );
}
