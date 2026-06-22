import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Loader2, Search } from "lucide-react";
import { PageMeta } from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import JobBoardCard from "@/features/jobBoard/JobBoardCard";
import JobBoardFilters, {
  defaultFilterState,
  filtersToQuery,
  JobBoardFilterFields,
  type JobBoardFilterState,
} from "@/features/jobBoard/JobBoardFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { usePublicJobs } from "@/hooks/usePublicJobs";

export default function JobBoardList() {
  const [filters, setFilters] = useState<JobBoardFilterState>(defaultFilterState);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, q: debouncedSearch }));
    setPage(1);
  }, [debouncedSearch]);

  const query = useMemo(() => filtersToQuery(filters, page), [filters, page]);
  const { jobs, meta, isLoading, isFetching, error } = usePublicJobs(query);

  const patchFilters = (patch: Partial<JobBoardFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters(defaultFilterState);
    setPage(1);
  };

  const activeFilterCount = [
    filters.location,
    filters.jobType,
    filters.workMode,
    filters.salaryMin,
    filters.salaryMax,
  ].filter(Boolean).length;

  return (
    <>
      <PageMeta
        title="Browse Jobs"
        description="Discover open roles from top companies. Filter by location, salary, job type, and work mode."
        path="/jobs"
      />

      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find your next role
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse published openings and apply with one click when you are ready.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop sidebar */}
          <aside className="hidden w-full shrink-0 lg:block lg:w-72">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
              <JobBoardFilters
                state={{ ...filters, q: searchInput }}
                onSearchChange={setSearchInput}
                onChange={patchFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Mobile search + filter sheet */}
            <div className="mb-4 flex gap-2 lg:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, skills…"
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Search jobs"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="sr-only">{activeFilterCount} active filters</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <JobBoardFilterFields
                      state={filters}
                      onChange={patchFilters}
                      onReset={resetFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading jobs…" : `${meta.total} job${meta.total === 1 ? "" : "s"} found`}
              </p>
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-lg font-medium text-foreground">No jobs match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or clearing filters.
                </p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobBoardCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
