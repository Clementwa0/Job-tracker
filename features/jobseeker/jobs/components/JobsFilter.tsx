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

const selectClass =
  "h-9 rounded-lg border border-input bg-background px-2.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

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
      className="rounded-xl border border-border bg-card p-3"
    >
      <h2 id="filter-heading" className="sr-only">
        Filter jobs
      </h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-grow">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, company, location…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search jobs"
              className="h-9 w-full rounded-lg border border-input bg-background/60 pl-8 pr-8 text-xs shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
            className={cn(selectClass, "w-full capitalize lg:w-36")}
          >
            {statusOptions.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            aria-label="Filter by priority"
            className={cn(selectClass, "w-full lg:w-32")}
          >
            {priorityOptions.map(({ label, value }) => (
              <option key={value || "all"} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort jobs"
            className={cn(selectClass, "w-full lg:w-40")}
          >
            {sortOptions.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <div className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-input bg-background p-0.5 shadow-sm sm:flex">
            <ViewBtn
              active={viewMode === "table"}
              onClick={() => onViewModeChange("table")}
              icon={<Rows3 className="h-3.5 w-3.5" />}
              label="Table"
            />
            <ViewBtn
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              icon={<LayoutGrid className="h-3.5 w-3.5" />}
              label="Grid"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
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
              className="h-6 text-[11px]"
            >
              <X className="mr-1 h-3 w-3" />
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
      "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

export default JobsFilter;