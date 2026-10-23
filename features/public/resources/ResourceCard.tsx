import Link from "next/link";
import { BookOpen, Download, ExternalLink, FileText, LayoutTemplate, ListChecks, PlayCircle, type LucideIcon } from "lucide-react";

import { ResourceTypeBadge } from "@/components/shared/resources/ResourceBadges";
import type { ResourceType } from "@/lib/resources/constants";
import type { ResourceListItem } from "@/types/resource";
import BookmarkButton from "./BookmarkButton";

const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  article: FileText,
  guide: BookOpen,
  template: LayoutTemplate,
  checklist: ListChecks,
  video: PlayCircle,
};

export default function ResourceCard({
  resource,
  basePath = "/resources",
  showBookmark = false,
  reason,
}: {
  resource: ResourceListItem;
  /** Where the detail page lives (public or inside the jobseeker dashboard). */
  basePath?: string;
  showBookmark?: boolean;
  /** Recommendation explanation, e.g. "You have an upcoming interview". */
  reason?: string;
}) {
  const Icon = TYPE_ICONS[resource.type];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:ring-3 focus-within:ring-ring/50">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-indigo-500/10">
        {resource.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset; next/image isn't configured for it
          <img src={resource.coverImageUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/50">
            <Icon className="size-12" strokeWidth={1.5} />
          </div>
        )}
        {showBookmark && (
          <div className="absolute right-2.5 top-2.5 z-10">
            <BookmarkButton resourceId={resource.id} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {reason && <p className="text-xs font-medium text-primary">{reason}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <ResourceTypeBadge type={resource.type} />
          {resource.category && <span className="truncate text-xs font-medium text-muted-foreground">{resource.category.name}</span>}
        </div>
        <h3 className="font-heading text-base font-semibold leading-snug tracking-tight">
          <Link href={`${basePath}/${resource.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {resource.title}
          </Link>
        </h3>
        {resource.description && <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.description}</p>}

        {(resource.hasAttachment || resource.hasExternalUrl) && (
          <div className="mt-auto flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
            {resource.hasAttachment && (
              <span className="inline-flex items-center gap-1">
                <Download className="size-3.5" /> Download available
              </span>
            )}
            {resource.hasExternalUrl && (
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="size-3.5" /> External link
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card" aria-hidden>
      <div className="aspect-[16/9] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
