import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import ResourceDetailView from "@/features/public/resources/ResourceDetailView";
import { loadPublishedResource } from "@/lib/resources/page-data";
import { incrementResourceViews } from "@/lib/resources/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// The public page is the indexable one; this dashboard copy is for signed-in readers only.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resource = await loadPublishedResource((await params).slug);
  return { title: resource?.title ?? "Resource not found", robots: { index: false, follow: false } };
}

export default async function JobseekerResourcePage({ params }: Props) {
  const resource = await loadPublishedResource((await params).slug);
  if (!resource) notFound();

  after(() => incrementResourceViews(resource.id).catch((e) => console.error("Failed to count view:", e)));

  return <ResourceDetailView resource={resource} basePath="/jobseeker/resources" />;
}
