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
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
      <header className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag handle for desktop */}
        {draggable && (
          <div className="hidden sm:flex items-center text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing">
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
              "h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 transition-all duration-200 flex-shrink-0",
              "group-hover/header:text-gray-600 dark:group-hover/header:text-gray-300",
              !open && "-rotate-90"
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200 transition-colors">
                {title}
              </h3>
              {itemCount !== undefined && itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0">
                  {itemCount}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 group-hover/header:text-gray-600 dark:group-hover/header:text-gray-300 transition-colors">
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
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 active:scale-95 transition-all"
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
          className="border-t border-gray-100 dark:border-gray-800 p-3 sm:p-5 space-y-4 sm:space-y-5"
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
        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400" aria-hidden="true">*</span>
          )}
        </span>
        {hint && !error && (
          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
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
  "w-full rounded-lg border border-gray-200 dark:border-gray-700",
  "bg-white dark:bg-gray-900",
  "px-3 py-2 sm:px-3.5 sm:py-2.5",
  "text-sm sm:text-base text-gray-900 dark:text-gray-100",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  
  // Focus styles
  "outline-none transition-all duration-200",
  "focus:border-blue-500 dark:focus:border-blue-400",
  "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
  
  // Hover styles
  "hover:border-gray-300 dark:hover:border-gray-600",
  
  // Disabled styles
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700",
  
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