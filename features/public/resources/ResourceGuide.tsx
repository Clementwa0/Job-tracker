import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

export type ResourceGuideKey = "career" | "resume" | "interview";

const guides: Record<ResourceGuideKey, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string; bullets: string[] }[] }> = {
  career: {
    eyebrow: "Career resources",
    title: "Make your next career move with a clear plan.",
    intro: "A practical starting point for organizing a job search, exploring roles, and making steady progress toward work that fits.",
    sections: [
      { title: "Choose a direction", body: "Use your strengths, interests, and constraints to decide which roles are worth pursuing.", bullets: ["List the work you do well and enjoy", "Identify role titles that match those strengths", "Compare requirements across real job listings"] },
      { title: "Build a steady search", body: "A repeatable routine makes it easier to stay focused and learn from each application.", bullets: ["Set a weekly time for finding and reviewing roles", "Keep a record of applications and follow-ups", "Adjust your approach when you see a pattern"] },
      { title: "Keep moving forward", body: "Use each conversation and application as useful feedback for your next step.", bullets: ["Prepare a few examples of your work", "Follow up clearly and professionally", "Make time to update your skills and profile"] },
    ],
  },
  resume: {
    eyebrow: "Resume tips",
    title: "Make your experience easy to understand.",
    intro: "A focused CV or resume helps a reader quickly see what you have done and how it relates to the role.",
    sections: [
      { title: "Lead with relevance", body: "Put the most useful information near the top and tailor the emphasis to the role.", bullets: ["Use a concise, specific summary", "Prioritize relevant experience and skills", "Use familiar section headings"] },
      { title: "Show your contribution", body: "Describe the work you owned and the outcome, using only details you can support.", bullets: ["Start bullets with clear action verbs", "Include measurable results when accurate", "Give enough context to explain your impact"] },
      { title: "Review before sharing", body: "A careful final pass improves readability and catches small issues.", bullets: ["Check dates, spelling, and contact details", "Keep formatting consistent and easy to scan", "Use the JobTrail Resume Builder to create or import a resume"] },
    ],
  },
  interview: {
    eyebrow: "Interview guide",
    title: "Prepare to explain your work with confidence.",
    intro: "Good preparation helps you give clear, relevant answers and ask useful questions about the role.",
    sections: [
      { title: "Before the conversation", body: "Understand the role and plan examples that show how you approach relevant work.", bullets: ["Review the job description and organization", "Choose examples that show your skills in action", "Plan logistics and test your meeting setup"] },
      { title: "During the interview", body: "Listen closely, answer the question asked, and make your reasoning easy to follow.", bullets: ["Use a simple situation, action, result structure", "Be specific about your own contribution", "Ask for clarification when a question is unclear"] },
      { title: "After the interview", body: "Close the loop professionally and note what you want to improve for next time.", bullets: ["Send a brief, thoughtful thank-you", "Record questions and follow-up dates", "Reflect on what went well and what to practice"] },
    ],
  },
};

export function ResourceGuide({ guide }: { guide: ResourceGuideKey }) {
  const content = guides[guide];
  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-indigo-500/5">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary"><BookOpen className="size-4" />{content.eyebrow}</p>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.intro}</p>
            <Link href={guide === "resume" ? "/jobseeker/resume" : guide === "interview" ? "/jobseeker/interview" : "/job-board"} className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{guide === "resume" ? "Open Resume Builder" : guide === "interview" ? "Explore interview preparation" : "Search jobs"}<ArrowRight className="ml-2 size-4" /></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3 lg:px-8">
        {content.sections.map((section, index) => <article key={section.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">0{index + 1}</p>
          <h2 className="mt-3 font-display text-xl font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
          <ul className="mt-5 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-2.5 text-sm leading-5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{bullet}</li>)}</ul>
        </article>)}
      </section>
    </main>
  );
}
