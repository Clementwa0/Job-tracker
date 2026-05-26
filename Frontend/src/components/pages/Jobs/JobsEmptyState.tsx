import React from "react";
import { BriefcaseBusiness, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  hasFilters: boolean;
  onAdd?: () => void;
  onClearFilters?: () => void;
}

const JobsEmptyState: React.FC<Props> = ({ hasFilters, onAdd, onClearFilters }) => {
  if (hasFilters) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          No matching jobs
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or clearing filters to see more results.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-4"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-gradient-to-b from-card to-card/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-border">
        <BriefcaseBusiness
          className="h-7 w-7 text-indigo-500 dark:text-indigo-400"
          aria-hidden
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Track your first application
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        Add roles you're interested in to track status, interviews, and deadlines
        all in one place.
      </p>
      {onAdd && (
        <Button onClick={onAdd} className="mt-5 gap-2">
          <Plus className="h-4 w-4" />
          Add your first job
        </Button>
      )}
    </div>
  );
};

export default JobsEmptyState;
