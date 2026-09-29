"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useDebounce } from "@/hooks/useDebounce";
import JobBoardCard from "./components/JobBoardCard";
import JobBoardFilters, {
  EMPTY_FILTERS,
  getActiveFilterChips,
  type JobBoardFilterValue,
} from "./components/JobBoardFilters";
import { publicJobBoardService } from "./services/publicJobBoard.client";

import type {
  PublicJobFilters,
  PublicJobListItem,
  PublicJobSort,
} from "@/types/jobPosting";

import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

interface Result {
  key: string;
  jobs: PublicJobListItem[];
  total: number;
  totalPages: number;
  error: boolean;
}

export default function JobBoardPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] =
    useState<JobBoardFilterValue>(EMPTY_FILTERS);

  const [sort, setSort] = useState<PublicJobSort>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [retry, setRetry] = useState(0);

  // List or two-column grid
  const [view, setView] = useState<"list" | "grid">("grid");

  const debouncedQuery = useDebounce(query, 300);
  const debouncedLocation = useDebounce(filters.location, 300);

  const filterParams = useMemo<PublicJobFilters>(
    () => ({
      q: debouncedQuery.trim() || undefined,
      location: debouncedLocation.trim() || undefined,
      category:
        filters.category !== "all" ? filters.category : undefined,
      jobType:
        filters.jobType !== "all" ? filters.jobType : undefined,
      workMode:
        filters.workMode !== "all" ? filters.workMode : undefined,
      experienceLevel:
        filters.experienceLevel !== "all"
          ? filters.experienceLevel
          : undefined,
      sort,
    }),
    [
      debouncedQuery,
      debouncedLocation,
      filters.category,
      filters.jobType,
      filters.workMode,
      filters.experienceLevel,
      sort,
    ],
  );

  const filterKey = JSON.stringify(filterParams);

  const [pageState, setPageState] = useState({
    key: "",
    page: 1,
  });

  const page =
    pageState.key === filterKey ? pageState.page : 1;

  const params = useMemo<PublicJobFilters>(
    () => ({
      ...filterParams,
      page,
      limit: PAGE_SIZE,
    }),
    [filterParams, page],
  );

  const requestKey = `${JSON.stringify(params)}#${retry}`;


  useEffect(() => {
    let cancelled = false;

    publicJobBoardService
      .list(params)
      .then(({ jobs, meta }) => {
        if (cancelled) return;

        setResult({
          key: requestKey,
          jobs,
          total: meta?.total ?? jobs.length,
          totalPages: meta?.totalPages ?? 1,
          error: false,
        });
      })
      .catch(() => {
        if (cancelled) return;

        setResult((prev) => ({
          key: requestKey,
          jobs: prev?.jobs ?? [],
          total: prev?.total ?? 0,
          totalPages: prev?.totalPages ?? 1,
          error: true,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [params, requestKey]);

  const loading = !result || result.key !== requestKey;

  const chips = getActiveFilterChips(filters);
  const hasFilters = chips.length > 0 || query.trim() !== "";

  const patchFilters = (
    patch: Partial<JobBoardFilterValue>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setQuery("");
  };

  const goToPage = (next: number) => {
    setPageState({
      key: filterKey,
      page: next,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles or keywords"
            aria-label="Search jobs"
            className="h-9 pl-8 text-[13px] md:text-[13px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="size-3.5" />

          Filters

          {chips.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {chips.length}
            </span>
          )}
        </Button>
      </div>


      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
          {chips.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                patchFilters({
                  [key]: key === "location" ? "" : "all",
                })
              }
              className="flex h-6 items-center gap-1 rounded-full bg-muted px-2 text-xs text-foreground"
            >
              {label}

              <X className="size-3 text-muted-foreground" />

              <span className="sr-only">
                Remove filter
              </span>
            </button>
          ))}
        </div>
      )}


      <div className="mt-5 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <JobBoardFilters
            value={filters}
            onChange={patchFilters}
            onClear={clearAll}
          />
        </aside>

        {/* Results */}
        <section
          aria-live="polite"
          className="min-w-0"
        >
          {/* Results toolbar */}
          <div className="mb-2 flex h-8 items-center justify-between text-xs text-muted-foreground">
            <span>
              {result && !result.error
                ? `${result.total} ${
                    result.total === 1 ? "role" : "roles"
                  }`
                : "\u00A0"}
            </span>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div
                className="flex items-center rounded-md border bg-background p-0.5"
                aria-label="Job view"
              >
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-sm transition-colors",
                    view === "list"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <List className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-label="Two-column view"
                  aria-pressed={view === "grid"}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-sm transition-colors",
                    view === "grid"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Columns2 className="size-3.5" />
                </button>
              </div>

              {/* Sort */}
              <label className="flex items-center gap-1.5">
                Sort

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as PublicJobSort,
                    )
                  }
                  className="h-6 rounded-md border-0 bg-transparent pr-1 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="salary">
                    Highest salary
                  </option>
                </select>
              </label>
            </div>
          </div>


          {result?.error ? (
            <Empty
              title="We couldn't load job postings."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRetry((n) => n + 1)
                  }
                >
                  Try again
                </Button>
              }
            />
          ) : !result ? (
            <ListSkeleton />
          ) : result.jobs.length === 0 ? (
            <Empty
              title="No roles match your search."
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {/* Job results */}
              <div
                className={cn(
                  "overflow-hidden rounded-lg border border-border bg-card transition-opacity",
                  loading && "opacity-60",

                  view === "list"
                    ? "divide-y divide-border"
                    : "grid grid-cols-1 gap-px bg-border md:grid-cols-2",
                )}
              >
                {result.jobs.map((job) => (
                  <div
                    key={job.id}
                    className={
                      view === "grid"
                        ? "min-w-0 bg-card"
                        : undefined
                    }
                  >
                    <JobBoardCard job={job} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      goToPage(page - 1)
                    }
                    className="gap-1"
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>

                  <span className="text-xs text-muted-foreground">
                    Page {page} of{" "}
                    {result.totalPages}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={
                      page >= result.totalPages ||
                      loading
                    }
                    onClick={() =>
                      goToPage(page + 1)
                    }
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] rounded-t-2xl"
        >
          <SheetHeader className="pb-0">
            <SheetTitle>Filters</SheetTitle>

            <SheetDescription className="sr-only">
              Narrow down the job list
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <JobBoardFilters
              variant="sheet"
              value={filters}
              onChange={patchFilters}
              onClear={clearAll}
            />
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-border">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={clearAll}
              disabled={chips.length === 0}
            >
              Reset
            </Button>

            <Button
              className="flex-1"
              onClick={() => setSheetOpen(false)}
            >
              {result && !result.error
                ? `Show ${result.total} roles`
                : "Show roles"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ListSkeleton() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
        >
          <div className="size-9 animate-pulse rounded-md bg-muted" />

          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function Empty({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      {action}
    </div>
  );
}