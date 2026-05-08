import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Tip = { title: string; description: string };

const TipCard = () => {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTip = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Tip>("/tip");
      setTip(data);
    } catch (err) {
      console.error("Failed to fetch tip:", err);
      setTip({ title: "Oops!", description: "Unable to fetch tip at the moment." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900">
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle className="text-md font-semibold">💡 Job Application Tip</CardTitle>
          <CardDescription>
            {loading ? "Fetching tip..." : tip?.title}
          </CardDescription>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={fetchTip}
          disabled={loading}
          title="Refresh Tip"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground dark:text-white">
          {loading ? "AI is thinking..." : tip?.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default TipCard;
