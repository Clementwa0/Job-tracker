import React from "react";
import { Search, X, LayoutGrid, Rows3, Loader2 } from "lucide-react";
import { statusOptions } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const priorityOptions = [
  { label: "All priorities", value: "" },
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const sortOptions = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Priority (high → low)", value: "-priority" },
  { label: "Priority (low → high)", value: "priority" },
  { label: "Status A–Z", value: "status" },
  { label: "Status Z–A", value: "-status" },
  { label: "Applied date", value: "-applicationDate" },
];

interface JobsFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  totalCount: number;
  filteredCount: number;
  isFetching?: boolean;
}

const JobsFilter: React.FC<JobsFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  isFetching,
}) => {
  const hasFilters = !!searchTerm || !!statusFilter || !!priorityFilter;

  return (
    <section
      aria-labelledby="filter-heading"
      className="sticky top-0 z-20 -mx-4 sm:mx-0 backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60 border-b border-border/60 sm:rounded-xl sm:border px-4 sm:px-4 py-3"
    >
      <h2 id="filter-heading" className="sr-only">
        Filter jobs
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, company, location…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search jobs"
              className="h-10 w-full rounded-lg border border-input bg-background/60 pl-10 pr-9 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
            className="h-10 w-full lg:w-44 rounded-lg border border-input bg-background px-3 text-sm shadow-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            {statusOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            aria-label="Filter by priority"
            className="h-10 w-full lg:w-40 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            {priorityOptions.map(({ label, value }) => (
              <option key={value || "all"} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort jobs"
            className="h-10 w-full lg:w-44 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            {sortOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg border border-input bg-background shadow-sm shrink-0">
            <ViewBtn
              active={viewMode === "table"}
              onClick={() => onViewModeChange("table")}
              icon={<Rows3 className="h-4 w-4" />}
              label="Table"
            />
            <ViewBtn
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Grid"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>
              <span className="font-medium text-foreground">{filteredCount}</span> on this page
              {totalCount > filteredCount && (
                <> · <span className="font-medium text-foreground">{totalCount}</span> total</>
              )}
              {hasFilters && " matching filters"}
            </span>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange("");
                onStatusFilterChange("");
                onPriorityFilterChange("");
              }}
              className="h-7 text-xs"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

interface ViewBtnProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ViewBtn: React.FC<ViewBtnProps> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-label={`${label} view`}
    className={cn(
      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition",
      active
        ? "bg-foreground text-background shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
    )}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

export default JobsFilter;
