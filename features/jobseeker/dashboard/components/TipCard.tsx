"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Sparkles, Copy, Bookmark } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { tipService, type Tip } from "@/features/jobseeker/dashboard/services/tip.client";

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
    <Card className="border-gold/25 bg-gold/[0.06] p-5 shadow-none">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-gold">
          <Sparkles className="h-3.5 w-3.5" />
          Career tip
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={fetchTip}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-2 mt-3">
        <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tip.description}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleCopy}>
          <Copy className="mr-1 h-3.5 w-3.5" />
          Copy
        </Button>

        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSave}>
          <Bookmark className="mr-1 h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </Card>
  );
};

export default TipCard;
