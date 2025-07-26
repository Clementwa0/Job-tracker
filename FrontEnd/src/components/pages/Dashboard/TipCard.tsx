import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

type Tip = { title: string; description: string };

const TipCard = () => {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/tip");
        setTip(res.data);
      } catch (err) {
        console.error("Failed to fetch tip:", err);
      }
    };

    fetchTip();
  }, []);

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-md font-semibold">💡 Job Application Tip</CardTitle>
        <CardDescription>{tip?.title || "Fetching tip..."}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground dark:text-white">
          {tip?.description || "AI is thinking..."}
        </p>
      </CardContent>
    </Card>
  );
};

export default TipCard;
