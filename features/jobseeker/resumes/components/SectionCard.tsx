"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  draggable?: boolean;
  itemCount?: number;
}

export default function SectionCard({
  title,
  description,
  children,
  onAdd,
  addLabel = "Add",
  defaultOpen = true,
  actions,
  draggable = false,
  itemCount,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, open]);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <header className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag handle for desktop */}
        {draggable && (
          <div className="hidden sm:flex items-center text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 flex-shrink-0" />
          </div>
        )}

        {/* Collapsible header button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 sm:gap-3 text-left flex-1 min-w-0 group/header"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground dark:text-muted-foreground transition-all duration-200 flex-shrink-0",
              "group-hover/header:text-muted-foreground",
              !open && "-rotate-90"
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover/header:text-foreground transition-colors">
                {title}
              </h3>
              {itemCount !== undefined && itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-muted bg-card text-muted-foreground dark:text-muted-foreground flex-shrink-0">
                  {itemCount}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 group-hover/header:text-muted-foreground transition-colors">
                {description}
              </p>
            )}
          </div>
        </button>

        {/* Actions and Add button */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {actions}
          {onAdd && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
                if (!open) setOpen(true);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border bg-card px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/40 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{addLabel}</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </header>

      {/* Collapsible content with smooth animation */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? `${contentHeight + 32}px` : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="border-t border-border p-3 sm:p-5 space-y-4 sm:space-y-5"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function Field({
  label,
  children,
  className,
  required = false,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400" aria-hidden="true">*</span>
          )}
        </span>
        {hint && !error && (
          <span className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground">
            {hint}
          </span>
        )}
        {error && (
          <span className="text-[10px] sm:text-xs text-red-500 dark:text-red-400 font-medium">
            {error}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

export const inputCls = cn(
  // Base styles
  "w-full rounded-lg border border-border",
  "bg-card",
  "px-3 py-2 sm:px-3.5 sm:py-2.5",
  "text-sm sm:text-base text-foreground",
  "placeholder:text-muted-foreground placeholder:text-muted-foreground",
  
  // Focus styles
  "outline-none transition-all duration-200",
  "focus:border-blue-500 dark:focus:border-blue-400",
  "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
  
  // Hover styles
  "hover:border-muted-foreground/40 hover:border-muted-foreground/40",
  
  // Disabled styles
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "disabled:hover:border-border",
  
  // Mobile optimization
  "min-h-[44px]", // iOS minimum touch target
  "appearance-none", // Remove default styling
);

// Additional input variants for different use cases
export const textareaCls = cn(
  inputCls,
  "resize-y min-h-[80px] sm:min-h-[100px]",
  "py-2.5 sm:py-3"
);

export const selectCls = cn(
  inputCls,
  "cursor-pointer pr-8",
  "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjNmI3MjgwIiBkPSJNNiA4LjgyNUwxLjE3NSA0IDIuMjM4IDIuOTM4IDYgNi43MDIgOS43NjMgMi45MzggMTAuODI1IDR6Ii8+PC9zdmc+')]",
  "bg-[length:12px] bg-[right_12px_center] bg-no-repeat",
  "dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjOWVhM2FkIiBkPSJNNiA4LjgyNUwxLjE3NSA0IDIuMjM4IDIuOTM4IDYgNi43MDIgOS43NjMgMi45zMzggMTAuODI1IDR6Ii8+PC9zdmc+')]"
);

// Responsive grid helper
export const formGridCls = "grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2";
export const fullWidthCls = "sm:col-span-2";