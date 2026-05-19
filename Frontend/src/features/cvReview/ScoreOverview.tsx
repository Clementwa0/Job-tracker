import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ScoreOverview({
  score,
}: {
  score: number;
}) {
  return (
    <div className="space-y-4">
      <div className="text-5xl font-bold">{score}/100</div>

      <Progress value={score} className="h-3" />

      <Badge>
        {score >= 75 ? "Good" : score >= 50 ? "Average" : "Needs Work"}
      </Badge>
    </div>
  );
}