"use client";

import { useState } from "react";
import { Columns2, List } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";

export default function JobBoardViewToggle() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="inline-flex items-center rounded-lg border bg-background p-1">
      <button
        type="button"
        onClick={() => setView("list")}
        aria-label="List view"
        aria-pressed={view === "list"}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          view === "list"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => setView("grid")}
        aria-label="Two-column view"
        aria-pressed={view === "grid"}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          view === "grid"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Columns2 className="size-4" />
      </button>
    </div>
  );
}