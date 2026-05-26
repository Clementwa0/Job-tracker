import { memo, type ReactNode, useCallback, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
  actions?: ReactNode;
}

function SectionCard({
  title,
  description,
  children,
  onAdd,
  addLabel = "Add",
  defaultOpen = true,
  actions,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const panelId = `section-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <header className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-500 transition-transform",
              !open && "-rotate-90",
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {description && (
              <p className="truncate text-xs text-gray-500">{description}</p>
            )}
          </div>
        </button>
        {actions}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
          </button>
        )}
      </header>
      {open && (
        <div
          id={panelId}
          className="space-y-4 border-t border-gray-100 p-4 dark:border-gray-800"
        >
          {children}
        </div>
      )}
    </section>
  );
}

export default memo(SectionCard);

/** Form field wrapper. Memoized — children are still re-rendered as needed. */
export const Field = memo(function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
});

export const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";