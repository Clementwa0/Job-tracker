import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import ResourceLibrary from "@/features/public/resources/ResourceLibrary";
import { loadLibraryInitialData } from "@/lib/resources/page-data";
import { getSiteUrl } from "@/lib/seo/siteUrl";

// Always read live data: publishing / unpublishing must show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career Resources",
  description: "Guides, templates and checklists to help you plan your career and run a focused job search.",
  alternates: { canonical: `${getSiteUrl()}/resources` },
  openGraph: {
    title: "Career Resources | JobTrail",
    description: "Guides, templates and checklists to help you plan your career and run a focused job search.",
    type: "website",
  },
};

export default async function ResourcesPage() {
  const initial = await loadLibraryInitialData().catch((error) => {
    console.error("Failed to preload resources:", error);
    return undefined; // the library falls back to fetching client-side
  });

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-indigo-500/5">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary">
            <BookOpen className="size-4" />
            Career resources
          </p>
          <h1 className="mt-5 max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Practical help for every step of your job search.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Browse guides, templates and checklists written to help you apply with confidence, prepare for interviews and keep your search organised.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ResourceLibrary mode="public" basePath="/resources" initial={initial} />
      </section>
    </div>
  );
}
