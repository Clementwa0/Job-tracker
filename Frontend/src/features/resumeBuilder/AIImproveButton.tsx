import { useState } from "react";
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

export default function AIImproveButton({ kind, text, context, onPick, label = "Improve with AI", size = "sm" }: Props) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const run = async () => {
    if (!text || text.trim().length < 3) {
      toast({ title: "Add some text first", description: "AI needs a few words to improve." });
      return;
    }
    setLoading(true);
    try {
      const { variants } = await aiService.improve(kind, text, context);
      setVariants(variants);
      setOpen(true);
      if (variants.length === 0) toast({ title: "No suggestions", description: "Try rewording your input." });
    } catch {
      toast({ title: "AI request failed", description: "Please try again in a moment." });
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

      {open && variants.length > 0 && (
        <div className="absolute right-0 z-20 mt-1 w-[320px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
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
