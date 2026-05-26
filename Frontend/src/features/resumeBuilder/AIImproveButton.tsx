import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { aiService, type ImproveKind } from "@/services/aiService";
import { toast } from "@/hooks/use-toast";

interface Props {
  kind: ImproveKind;
  text: string;
  context?: string;
  onPick: (variant: string) => void;
  label?: string;
  size?: "sm" | "md";
}

const SIZE_CLS = {
  sm: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
  md: "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
} as const;

function AIImproveButton({
  kind,
  text,
  context,
  onPick,
  label = "Improve with AI",
  size = "sm",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close popover on outside click + Escape. */
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = useCallback(async () => {
    if (!text || text.trim().length < 3) {
      toast({ title: "Add some text first", description: "AI needs a few words to improve." });
      return;
    }
    setLoading(true);
    try {
      const { variants: v } = await aiService.improve(kind, text, context);
      setVariants(v);
      setOpen(true);
      if (v.length === 0) {
        toast({ title: "No suggestions", description: "Try rewording your input." });
      }
    } catch {
      toast({ title: "AI request failed", description: "Please try again in a moment." });
    } finally {
      setLoading(false);
    }
  }, [text, context, kind]);

  const pick = useCallback(
    (v: string) => {
      onPick(v);
      setOpen(false);
    },
    [onPick],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${SIZE_CLS[size]} border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-3 w-3" aria-hidden />
        )}
        {label}
      </button>

      {open && variants.length > 0 && (
        <div
          role="listbox"
          aria-label="AI suggestions"
          className="absolute right-0 z-20 mt-1 w-[320px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Suggestions
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-1">
            {variants.map((v, i) => (
              <li key={i}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(v)}
                  className="block w-full rounded-md p-2 text-left text-xs text-gray-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-200 dark:hover:bg-indigo-950/40"
                >
                  {v}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(AIImproveButton);