import { useEffect, useState } from "react";
import { RefreshCcw, Lightbulb, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "@/lib/axios";

type Tip = { title: string; description: string };

const TipCard = () => {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTip = async () => {
    try {
      setLoading(true);
      const { data } = await API.get<Tip>("/tip");
      setTip(data);
    } catch (err) {
      console.error("Failed to fetch tip:", err);
      setTip({ 
        title: "Oops!", 
        description: "Unable to fetch tip at the moment." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all dark:bg-gray-900 border-l-4 border-l-amber-400">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            {loading ? (
              <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
            ) : (
              <Lightbulb className="h-5 w-5 text-amber-600" />
            )}
          </div>
          <div>
            <CardTitle className="text-md font-semibold">
              💡 Job Application Tip
            </CardTitle>
            <CardDescription className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {loading ? "Fetching tip..." : tip?.title}
            </CardDescription>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={fetchTip}
          disabled={loading}
          title="Refresh Tip"
          className="hover:bg-amber-50 dark:hover:bg-amber-900"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></span>
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200"></span>
                  <span className="ml-2">AI is thinking...</span>
                </span>
              ) : (
                tip?.description
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipCard;