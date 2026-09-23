import type { ReactNode } from "react";
import {
  BookOpen,
  Compass,
  Flag,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";

export type JourneyStep = { n: number; title: string; desc: string };
export type JourneyNode = {
  icon: ReactNode;
  title: string;
  desc: string;
  top: string;
  left: string;
};
export type RecommendedRole = {
  title: string;
  category: string;
  match: string;
};

type Props = {
  headingLines: [string, string];
  subtext: string;
  steps: JourneyStep[];
  activeStep?: number;
  recommended?: RecommendedRole[];
  nodes: JourneyNode[];
  journeyTitle?: string;
};

export function JourneyPanel({
  headingLines,
  subtext,
  steps,
  activeStep = 1,
  recommended,
  nodes,
  journeyTitle = "Your journey",
}: Props) {
  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_75%_25%,#eae7ff_0,transparent_28%),linear-gradient(145deg,#eef2ff_0%,#f8faff_55%,#e3e8ff_100%)] p-8 lg:flex lg:p-10">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#b7bfff_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Heading */}
      <header className="relative z-10 max-w-md">
        <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-1.4px] text-[#071632]">
          {headingLines[0]}
          <br />
          <span className="bg-gradient-to-r from-[#2563eb] to-[#6d45dd] bg-clip-text text-transparent">
            {headingLines[1]}
          </span>
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-500">{subtext}</p>
      </header>

      {/* Journey map */}
      <div className="relative z-10 mt-8 h-[220px] flex-1">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 480 260"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M20 230 C120 230 140 150 220 140 C300 130 300 60 420 40"
            stroke="#a6b3fb"
            strokeWidth="2.5"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
          <path
            d="M340 55 L420 40 L405 105"
            stroke="#4338e0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {nodes.map((node, i) => (
          <div
            key={node.title}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ top: node.top, left: node.left }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#eff5ff] text-[#2563eb] shadow-[0_4px_12px_rgba(75,76,160,.18)]">
              {node.icon}
            </div>
            <div
              className={`mt-1.5 w-32 rounded-lg border border-slate-100 bg-white p-2.5 shadow-[0_4px_12px_rgba(15,23,42,.08)] ${i % 2 ? "translate-y-1.5" : "-translate-y-0.5"}`}
            >
              <p className="text-[11px] font-semibold text-[#071632]">
                {node.title}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                {node.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress card */}
      <div className="relative z-10 mt-6 rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_20px_rgba(31,53,121,.12)] backdrop-blur">
        <p className="text-[13px] font-semibold text-[#071632]">{journeyTitle}</p>

        <div className="mt-3 flex items-start">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="flex flex-1 items-start last:flex-none"
            >
              <div className="flex flex-col items-start gap-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step.n <= activeStep ? "bg-[#2563eb] text-white" : "border border-slate-200 text-slate-400"}`}
                >
                  {step.n}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#071632]">
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 mt-[11px] h-px flex-1 ${step.n < activeStep ? "bg-[#2563eb]" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {recommended && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-[13px] font-semibold text-[#071632]">
              Recommended for you
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {recommended.map((rec) => (
                <div
                  key={rec.title}
                  className="rounded-lg bg-slate-50 p-2.5 text-left"
                >
                  <p className="text-[11px] font-semibold text-[#071632]">
                    {rec.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{rec.category}</p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                    {rec.match} Match
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export const signupNodes: JourneyNode[] = [
  {
    icon: <Compass className="h-4 w-4" />,
    title: "Discover",
    desc: "Understand your strengths and goals.",
    top: "88%",
    left: "8%",
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    title: "Learn",
    desc: "Build in-demand skills and stay sharp.",
    top: "55%",
    left: "38%",
  },
  {
    icon: <Target className="h-4 w-4" />,
    title: "Grow",
    desc: "Gain experience and achieve more.",
    top: "32%",
    left: "68%",
  },
  {
    icon: <Flag className="h-4 w-4" />,
    title: "Achieve",
    desc: "Reach your goals and go further.",
    top: "10%",
    left: "92%",
  },
];

export const loginNodes: JourneyNode[] = [
  {
    icon: <Compass className="h-4 w-4" />,
    title: "Discover",
    desc: "Explore roles and industries.",
    top: "85%",
    left: "8%",
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    title: "Prepare",
    desc: "Build skills and boost confidence.",
    top: "58%",
    left: "38%",
  },
  {
    icon: <Send className="h-4 w-4" />,
    title: "Apply",
    desc: "Find opportunities and stand out.",
    top: "35%",
    left: "66%",
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Next Move",
    desc: "Grow your career and make impact.",
    top: "12%",
    left: "92%",
  },
];
