import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { tipService, type Tip } from "@/services/tipService";

const fallbackTip: Tip = {
  title: "Tailor your resume",
  description:
    "Mirror keywords from the job description in your resume. Recruiters scan quickly—make it count.",
};

const TipCard = () => {
  const [tip, setTip] = useState<Tip>(fallbackTip);
  const [loading, setLoading] = useState(false);

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
  }, []);

  return (
    <Card className="border-l-4 border-l-sky-500 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        {/* Left side */}
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
            {loading ? (
              <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
            ) : (
              <Lightbulb className="h-5 w-5 text-amber-600" />
            )}
          </div>

          <div>
            <CardTitle className="text-base font-semibold">
              Job Application Tip
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">
              {loading ? "Loading tip..." : tip.title}
            </CardDescription>
          </div>
        </div>

        {/* Refresh */}
        <Button
          size="icon"
          variant="ghost"
          onClick={fetchTip}
          disabled={loading}
        >
          <RefreshCcw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">Generating insight...</span>
            </span>
          ) : (
            tip.description
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default TipCard;