import { Clock, Download, ExternalLink, FileText } from "lucide-react";

import { ResourceTypeBadge } from "./ResourceBadges";
import { formatDate, formatFileSize } from "./format";
import type { ResourceType } from "@/lib/resources/constants";

export interface ResourceArticleData {
  title: string;
  description?: string;
  type: ResourceType;
  categoryName?: string | null;
  coverImageUrl?: string | null;
  /** HTML that has already been sanitized (server) or comes from the Tiptap schema (editor preview). */
  html: string;
  publishedAt?: string | null;
  readingMinutes?: number;
  tags?: string[];
  attachment?: { url: string; originalFilename: string; size: number } | null;
  externalUrl?: string | null;
}

/** Presentational article body shared by the public page, jobseeker page and admin preview. */
export default function ResourceArticle({ data }: { data: ResourceArticleData }) {
  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <ResourceTypeBadge type={data.type} />
          {data.categoryName && <span className="text-sm font-medium text-primary">{data.categoryName}</span>}
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{data.title || "Untitled resource"}</h1>
        {data.description && <p className="text-lg leading-7 text-muted-foreground">{data.description}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {data.publishedAt && <span>{formatDate(data.publishedAt)}</span>}
          {data.readingMinutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {data.readingMinutes} min read
            </span>
          ) : null}
        </div>
      </header>

      {data.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset; next/image isn't configured for it
        <img
          src={data.coverImageUrl}
          alt=""
          className="mt-6 aspect-[16/9] w-full rounded-2xl border border-border object-cover"
        />
      )}

      {(data.attachment || data.externalUrl) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {data.attachment && (
            <a
              href={data.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              download={data.attachment.originalFilename}
              className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{data.attachment.originalFilename}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(data.attachment.size)}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                <Download className="size-4" />
                Download
              </span>
            </a>
          )}
          {data.externalUrl && (
            <a
              href={data.externalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40"
            >
              <ExternalLink className="size-4 text-primary" />
              Open external link
            </a>
          )}
        </div>
      )}

      {data.html && <div className="resource-prose mt-8" dangerouslySetInnerHTML={{ __html: data.html }} />}

      {data.tags && data.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {data.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
