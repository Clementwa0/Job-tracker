import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Sparkles,
  Copy,
  Bookmark,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { tipService, type Tip } from "@/services/tipService";

const fallbackTip: Tip = {
  title: "Tailor your resume",
  description:
    "Mirror keywords from the job description in your resume. Recruiters scan quickly—make it count.",
};

const TipCard = () => {
  const [tip, setTip] = useState<Tip>(fallbackTip);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  const fetchTip = async () => {
    try {
      setLoading(true);
      const nextTip = await tipService.getDailyTip();
      setTip(nextTip);
    } catch (err) {
      console.error("Failed to fetch tip:", err);
      setTip(fallbackTip);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();

    const stored = localStorage.getItem("saved_tips");
    if (stored) {
      setSaved(JSON.parse(stored));
    }
  }, []);

  const tipText = `${tip.title}: ${tip.description}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tipText);
    toast.success("Tip copied");
  };

  const handleSave = () => {
    if (saved.includes(tipText)) {
      toast.info("Tip already saved");
      return;
    }

    const next = [...saved, tipText];
    setSaved(next);
    localStorage.setItem("saved_tips", JSON.stringify(next));

    toast.success("Tip saved");
  };

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-pink-500/10 pointer-events-none" />

      <CardContent className="relative ">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI Career Tip
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchTip}
            disabled={loading}
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {tip.title}
          </h3>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {tip.description}
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleCopy}
          >
            <Copy className="mr-1 h-3.5 w-3.5" />
            Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleSave}
          >
            <Bookmark className="mr-1 h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipCard;