import React from "react";
import { Search, X, SlidersHorizontal, LayoutGrid, Rows3 } from "lucide-react";
import { statusOptions } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JobsFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  totalCount: number;
  filteredCount: number;
}

const JobsFilter: React.FC<JobsFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}) => {
  const hasFilters = !!searchTerm || !!statusFilter;

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
          {/* Search */}
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

          {/* Status select */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by status"
              className="h-10 w-full lg:w-56 rounded-lg border border-input bg-background/60 pl-10 pr-8 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring capitalize"
            >
              {statusOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg border border-input bg-background/60 shadow-sm">
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
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredCount}</span>{" "}
            of {totalCount} {totalCount === 1 ? "job" : "jobs"}
            {hasFilters && " match your filters"}
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange("");
                onStatusFilterChange("");
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
