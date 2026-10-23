"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookOpen, Search, Sparkles, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OptionSelect from "@/components/shared/resources/OptionSelect";
import { useDebounce } from "@/hooks/useDebounce";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/resources/constants";
import { cn } from "@/lib/utils";
import type { PaginatedMeta } from "@/types/admin";
import type { RecommendedResource, ResourceCategory, ResourceListItem } from "@/types/resource";
import ResourceCard, { ResourceCardSkeleton } from "./ResourceCard";
import ResourcePagination from "./ResourcePagination";
import { resourcesService, type ResourcePage } from "./services/resources.client";
import { useResourceBookmarks } from "./useResourceBookmarks";

const PAGE_SIZE = 9;

export interface ResourceLibraryInitialData {
  page: ResourcePage;
  categories: ResourceCategory[];
  featured: ResourceListItem[];
}

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...RESOURCE_TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t] })),
];

const EMPTY_META: PaginatedMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

interface Result {
  key: string;
  items: ResourceListItem[];
  meta: PaginatedMeta;
  error: boolean;
}

const keyFor = (p: { tab: string; q: string; category: string; type: string; page: number }) => JSON.stringify(p);

/**
 * The resource library: search, category/type filters, featured section and
 * pagination. Used as-is on the public /resources page (seeded with
 * server-rendered `initial` data for SEO) and inside the jobseeker dashboard,
 * where it also offers bookmarks, a "Saved" tab and recommendations.
 */
export default function ResourceLibrary({
  mode = "public",
  basePath = "/resources",
  initial,
}: {
  mode?: "public" | "jobseeker";
  basePath?: string;
  initial?: ResourceLibraryInitialData;
}) {
  const isSeeker = mode === "jobseeker";

  const [tab, setTab] = useState<"browse" | "saved">("browse");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const debouncedQ = useDebounce(q.trim(), 300);

  const [categories, setCategories] = useState<ResourceCategory[]>(initial?.categories ?? []);
  const [featured, setFeatured] = useState<ResourceListItem[]>(initial?.featured ?? []);
  const [recommended, setRecommended] = useState<RecommendedResource[]>([]);

  const defaultKey = keyFor({ tab: "browse", q: "", category: "all", type: "all", page: 1 });
  const [result, setResult] = useState<Result | null>(
    initial ? { key: defaultKey, items: initial.page.items, meta: initial.page.meta, error: false } : null,
  );

  const bookmarks = useResourceBookmarks();

  // Any filter change returns to page 1 (derived so there's no extra render pass).
  const filterSig = `${tab}|${debouncedQ}|${category}|${type}`;
  const [pageFor, setPageFor] = useState(filterSig);
  const currentPage = pageFor === filterSig ? page : 1;
  const setPageAndSig = (next: number) => {
    setPageFor(filterSig);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestKey = keyFor({ tab, q: debouncedQ, category, type, page: currentPage }) + `#${retry}`;
  const baseKey = requestKey.replace(/#\d+$/, "");

  useEffect(() => {
    if (!initial) resourcesService.categories().then(setCategories).catch(() => undefined);
    if (!initial) resourcesService.list({ featured: true, limit: 3 }).then((r) => setFeatured(r.items)).catch(() => undefined);
  }, [initial]);

  useEffect(() => {
    if (!isSeeker) return;
    resourcesService.recommended().then(setRecommended).catch(() => undefined);
  }, [isSeeker]);

  useEffect(() => {
    // The server already rendered the default view.
    if (retry === 0 && baseKey === defaultKey && initial) return;
    let cancelled = false;
    const run =
      tab === "saved"
        ? resourcesService.bookmarks({ page: currentPage, limit: PAGE_SIZE })
        : resourcesService.list({
            q: debouncedQ || undefined,
            category: category === "all" ? undefined : category,
            type: type === "all" ? undefined : type,
            page: currentPage,
            limit: PAGE_SIZE,
          });
    run
      .then((r) => !cancelled && setResult({ key: requestKey, items: r.items, meta: r.meta, error: false }))
      .catch(() => !cancelled && setResult((prev) => ({ key: requestKey, items: prev?.items ?? [], meta: prev?.meta ?? EMPTY_META, error: true })));
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedQ, category, type, currentPage, retry, requestKey, baseKey, defaultKey, initial]);

  const loading = !result || (result.key !== requestKey && !(result.key === baseKey && retry === 0));
  const isDefaultView = tab === "browse" && !debouncedQ && category === "all" && type === "all" && currentPage === 1;
  const hasFilters = !!q.trim() || category !== "all" || type !== "all";

  const shownItems = useMemo(
    // In "Saved", un-bookmarking drops the card right away instead of after a refetch.
    () => (tab === "saved" && bookmarks.enabled && !bookmarks.isLoading ? (result?.items ?? []).filter((r) => bookmarks.ids.has(r.id)) : (result?.items ?? [])),
    [tab, result, bookmarks.enabled, bookmarks.isLoading, bookmarks.ids],
  );

  const clearAll = () => {
    setQ("");
    setCategory("all");
    setType("all");
  };

  return (
    <div className="space-y-8">
      {isSeeker && (
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5" role="tablist" aria-label="Resource views">
          {(
            [
              { id: "browse", label: "Browse", icon: BookOpen },
              { id: "saved", label: "Saved", icon: Bookmark },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "browse" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search guides, templates, checklists…"
                aria-label="Search resources"
                className="h-10 rounded-xl bg-card pl-9"
              />
            </div>
            <OptionSelect aria-label="Filter by type" value={type} onChange={setType} options={TYPE_OPTIONS} className="h-10 sm:w-44" />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
              {[{ id: "all", slug: "all", name: "All", resourceCount: undefined as number | undefined }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    category === c.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {c.name}
                  {c.resourceCount !== undefined && <span className="ml-1.5 text-xs opacity-70">{c.resourceCount}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isSeeker && tab === "browse" && isDefaultView && recommended.length > 0 && (
        <section aria-labelledby="recommended-heading" className="space-y-3">
          <h2 id="recommended-heading" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Sparkles className="size-5 text-primary" />
            Recommended for you
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((r) => (
              <ResourceCard key={r.id} resource={r} basePath={basePath} showBookmark reason={r.reason} />
            ))}
          </div>
        </section>
      )}

      {tab === "browse" && isDefaultView && featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="space-y-3">
          <h2 id="featured-heading" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Star className="size-5 fill-amber-400 text-amber-500" />
            Featured
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <ResourceCard key={r.id} resource={r} basePath={basePath} showBookmark={isSeeker} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-heading" aria-live="polite" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="all-heading" className="font-heading text-lg font-semibold">
            {tab === "saved" ? "Saved resources" : isDefaultView && featured.length > 0 ? "All resources" : "Resources"}
          </h2>
          {result && !result.error && <span className="text-sm text-muted-foreground">{result.meta.total} {result.meta.total === 1 ? "result" : "results"}</span>}
        </div>

        {result?.error && shownItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-destructive/40 px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">We couldn&apos;t load resources right now.</p>
            <Button variant="outline" size="sm" onClick={() => setRetry((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : !result || (loading && shownItems.length === 0) ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading resources">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : shownItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            {tab === "saved" ? (
              <>
                <Bookmark className="size-9 text-muted-foreground/60" />
                <p className="font-medium">Nothing saved yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">Tap the bookmark on any resource to keep it here for later.</p>
                <Button variant="outline" size="sm" onClick={() => setTab("browse")}>
                  Browse resources
                </Button>
              </>
            ) : (
              <>
                <BookOpen className="size-9 text-muted-foreground/60" />
                <p className="font-medium">{hasFilters ? "No resources match your search" : "No resources published yet"}</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {hasFilters ? "Try different keywords or clear your filters." : "Check back soon: new guides and templates are on the way."}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <X /> Clear filters
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className={cn("grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3", loading && "opacity-60")}>
              {shownItems.map((r) => (
                <ResourceCard key={r.id} resource={r} basePath={basePath} showBookmark={isSeeker} />
              ))}
            </div>
            <ResourcePagination page={currentPage} totalPages={result?.meta.totalPages ?? 1} onPageChange={setPageAndSig} disabled={loading} />
          </>
        )}
      </section>

      {isSeeker && (
        <p className="text-center text-xs text-muted-foreground">
          Looking for jobs instead? <Link href="/job-board" className="font-medium text-primary hover:underline">Browse the job board</Link>
        </p>
      )}
    </div>
  );
}
