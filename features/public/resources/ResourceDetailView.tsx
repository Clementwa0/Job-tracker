import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ResourceArticle from "@/components/shared/resources/ResourceArticle";
import { getRelatedResources } from "@/lib/resources/queries";
import type { PublicResource } from "@/types/resource";
import BookmarkButton from "./BookmarkButton";
import ResourceCard from "./ResourceCard";

/** Server component: article + bookmark (jobseekers only) + related resources. */
export default async function ResourceDetailView({
  resource,
  basePath,
}: {
  resource: PublicResource & { categoryId: string };
  basePath: string;
}) {
  const related = await getRelatedResources({ id: resource.id, categoryId: resource.categoryId, tags: resource.tags }, 3);

  return (
    <div className="space-y-12">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          All resources
        </Link>
        <BookmarkButton resourceId={resource.id} variant="labeled" />
      </div>

      <ResourceArticle
        data={{
          title: resource.title,
          description: resource.description,
          type: resource.type,
          categoryName: resource.category?.name,
          coverImageUrl: resource.coverImageUrl,
          html: resource.content,
          publishedAt: resource.publishedAt,
          readingMinutes: resource.readingMinutes,
          tags: resource.tags,
          attachment: resource.attachment,
          externalUrl: resource.externalUrl,
        }}
      />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto w-full max-w-6xl border-t border-border pt-10">
          <h2 id="related-heading" className="mb-5 font-heading text-xl font-semibold">
            Related resources
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ResourceCard key={r.id} resource={r} basePath={basePath} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
