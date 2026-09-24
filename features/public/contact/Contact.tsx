import {
  BriefcaseBusiness,
  ChevronRight,
  Handshake,
  Mail,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { SectionWrapper } from "@/components/shared/public/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ContactForm from "./ContactForm";

type Topic = {
  Icon: LucideIcon;
  title: string;
  copy: string;
  email: string;
  tone: string;
};

const topics: Topic[] = [
  {
    Icon: Mail,
    title: "General",
    copy: "Questions about JobTrail?",
    email: "hello@jobtrail.com",
    tone: "from-blue-500 to-indigo-500",
  },
  {
    Icon: UserRound,
    title: "Job seekers",
    copy: "Need help finding a job?",
    email: "support@jobtrail.com",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    Icon: BriefcaseBusiness,
    title: "Employers",
    copy: "Post a job or find talent?",
    email: "employers@jobtrail.com",
    tone: "from-violet-500 to-purple-600",
  },
  {
    Icon: Handshake,
    title: "Partnerships",
    copy: "Partner or integrate with us?",
    email: "partnerships@jobtrail.com",
    tone: "from-amber-500 to-orange-500",
  },
];

export default function Contact() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-purple-400/20 blur-3xl" />

      <SectionWrapper
        className="relative z-10"
        spacingClassName="py-8 sm:py-10 lg:py-14"
      >
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#071337] sm:text-3xl">
            Let&apos;s move your career forward.
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Have a question, need support, or want to explore how JobTrail can
            help? We&apos;re here for you.
          </p>
        </div>

        {/* Content */}
        <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="order-2 w-full lg:order-1 lg:sticky lg:top-24">
            <Topics />
          </div>
          <div className="order-1 w-full lg:order-2 lg:max-w-[420px]">
            <ContactForm />
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}

function Topics() {
  return (
    <Card className="w-full rounded-2xl border-white/60 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl lg:w-[320px] lg:shrink-0">
      <CardHeader className="border-b border-slate-100/80 px-4 py-3">
        <CardTitle className="text-sm font-semibold text-slate-900">
          How can we help?
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-3">
        <div className="divide-y divide-slate-100">
          {topics.map(({ Icon, title, copy, email, tone }) => (
            <a
              key={title}
              href={`mailto:${email}`}
              className="group flex items-center gap-3 px-1 py-3 transition-colors first:pt-3 last:pb-1 hover:bg-slate-50/60"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white shadow-md`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900">
                  {title}
                </span>

                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {copy}
                </span>

                <span className="mt-0.5 block truncate text-[11px] font-medium text-[#1467dc]">
                  {email}
                </span>
              </span>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}