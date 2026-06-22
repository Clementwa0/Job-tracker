import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { aiService, type ImproveKind } from "@/services/aiService";
import { getApiErrorMessage } from "@/lib/apiError";

interface Props {
  kind: ImproveKind;
  text: string;
  context?: string;
  onPick: (variant: string) => void;
  label?: string;
  size?: "sm" | "md";
}

export default function AIImproveButton({ kind, text, context, onPick, label = "Improve with AI", size = "sm" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const run = async () => {
    if (!text || text.trim().length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const { variants: next } = await aiService.improve(kind, text, context);
      setVariants(next);
      setOpen(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const baseCls =
    size === "sm"
      ? "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
      : "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className={`${baseCls} border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300`}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        {label}
      </button>

      {error && (
        <div className="absolute right-0 z-20 mt-1 w-[280px] rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
          <p className="text-destructive">{error}</p>
          <button type="button" onClick={run} className="mt-2 inline-flex items-center gap-1 text-primary hover:underline">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {open && variants.length > 0 && (
        <div className="absolute right-0 z-20 mt-1 w-[320px] rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Suggestions</p>
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
                  onClick={() => {
                    onPick(v);
                    setOpen(false);
                  }}
                  className="block w-full rounded-md p-2 text-left text-xs text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-indigo-950/40"
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
