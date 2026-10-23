import { cache } from "react";

import { listCategories } from "./categories";
import { getPublishedResourceBySlug, listPublishedResources } from "./queries";

/** Request-memoised so generateMetadata and the page share one query. */
export const loadPublishedResource = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  return getPublishedResourceBySlug(slug);
});

/** First page + categories + featured, for server-seeding the public library. */
export async function loadLibraryInitialData() {
  const [page, categories, featured] = await Promise.all([
    listPublishedResources({ page: 1, limit: 9 }),
    listCategories({ publicOnly: true }),
    listPublishedResources({ featured: true, page: 1, limit: 3 }),
  ]);
  return {
    page: { items: page.data, meta: page.meta },
    categories: categories.filter((c) => c.resourceCount > 0),
    featured: featured.data,
  };
}
