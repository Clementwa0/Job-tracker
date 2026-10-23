"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResourceBookmarks } from "./useResourceBookmarks";

/** Renders nothing unless a jobseeker is signed in. */
export default function BookmarkButton({
  resourceId,
  variant = "icon",
  className,
}: {
  resourceId: string;
  variant?: "icon" | "labeled";
  className?: string;
}) {
  const { enabled, ids, isLoading, toggle } = useResourceBookmarks();
  if (!enabled) return null;
  const saved = ids.has(resourceId);
  const Icon = saved ? BookmarkCheck : Bookmark;

  if (variant === "labeled") {
    return (
      <Button variant={saved ? "default" : "outline"} disabled={isLoading} aria-pressed={saved} onClick={() => toggle(resourceId)} className={className}>
        <Icon />
        {saved ? "Saved" : "Save for later"}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="icon-sm"
      disabled={isLoading}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved resources" : "Save resource"}
      title={saved ? "Remove from saved" : "Save for later"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(resourceId);
      }}
      className={cn("bg-background/90 backdrop-blur", saved && "border-primary/40 text-primary", className)}
    >
      <Icon />
    </Button>
  );
}
