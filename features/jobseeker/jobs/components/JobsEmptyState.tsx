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
      <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No matching jobs</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or clearing filters.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-3 h-8 text-xs">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-gradient-to-b from-card to-card/40 px-6 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-border">
        <BriefcaseBusiness className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">
        Track your first application
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
        Add roles you&apos;re interested in to track status, interviews, and deadlines.
      </p>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="mt-4 h-8 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add your first job
        </Button>
      )}
    </div>
  );
};

export default JobsEmptyState;