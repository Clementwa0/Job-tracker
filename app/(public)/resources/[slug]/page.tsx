import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import ResourceDetailView from "@/features/public/resources/ResourceDetailView";
import { loadPublishedResource } from "@/lib/resources/page-data";
import { incrementResourceViews } from "@/lib/resources/queries";
import { htmlToPlainText } from "@/lib/resources/sanitize";
import { getSiteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function excerpt(text: string, max = 160) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = await loadPublishedResource(slug);
  // Unknown or unpublished: no metadata that confirms the resource exists.
  if (!resource) return { title: "Resource not found", robots: { index: false } };

  const title = resource.seoTitle || resource.title;
  const description = resource.seoDescription || resource.description || excerpt(htmlToPlainText(resource.content));
  const url = `${getSiteUrl()}/resources/${resource.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: resource.publishedAt ?? undefined,
      modifiedTime: resource.updatedAt,
      tags: resource.tags,
      images: resource.coverImageUrl ? [{ url: resource.coverImageUrl }] : undefined,
    },
    twitter: { card: resource.coverImageUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const resource = await loadPublishedResource(slug);
  if (!resource) notFound();

  after(() => incrementResourceViews(resource.id).catch((e) => console.error("Failed to count view:", e)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resource.seoTitle || resource.title,
    description: resource.seoDescription || resource.description,
    datePublished: resource.publishedAt ?? undefined,
    dateModified: resource.updatedAt,
    image: resource.coverImageUrl ?? undefined,
    mainEntityOfPage: `${getSiteUrl()}/resources/${resource.slug}`,
    publisher: { "@type": "Organization", name: "JobTrail" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        // "<" escaped so content can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ResourceDetailView resource={resource} basePath="/resources" />
    </div>
  );
}
