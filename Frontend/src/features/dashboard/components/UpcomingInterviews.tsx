import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Video, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useInterviews } from "@/hooks/useInterviews";
import { isPopulatedJobId } from "@/types/interview";
import { interviewStatus } from "@/constants";

const InterviewItem = ({ i, statusCfg }: { i: any; statusCfg: any }) => {
  return (
    <li className="rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:bg-muted/40 hover:shadow-sm">
      <Link to="/interviews" className="block space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {i.stage.charAt(0).toUpperCase() + i.stage.slice(1).toLowerCase()}{" "}
              Interview
            </p>

            <p className="mt-1 text-xs text-muted-foreground truncate">
              {isPopulatedJobId(i.jobId)
                ? `${i.jobId.companyName} · ${i.jobId.jobTitle}`
                : "Job details unavailable"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {i.date.toLocaleString()}
          </span>
          <Badge
            variant="outline"
            className={`rounded-full text-[10px] uppercase tracking-wide ${
              statusCfg?.className || ""
            }`}
          >
            {statusCfg?.label || i.status}
          </Badge>
        </div>
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
            <Video className="h-3.5 w-3.5" />
            Join interview
          </span>
        </div>
      </Link>
    </li>
  );
};

const UpcomingInterviews = () => {
  const { interviews, loading } = useInterviews();

  const sorted = useMemo(() => {
    return [...interviews]
      .map((i) => ({
        ...i,
        date: new Date(i.interviewDate),
      }))
      .filter(
        (i) =>
          !isNaN(i.date.getTime()) &&
          i.status !== "completed" &&
          i.status !== "canceled",
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [interviews]);

  return (
    <Card className="border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Upcoming interviews
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Stay prepared for your next opportunity
          </p>
        </div>

        <Link
          to="/interviews"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            No interviews scheduled
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your upcoming interviews will appear here
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {sorted.map((i) => {
            const cfg = interviewStatus.find((s) => s.value === i.status);

            return <InterviewItem key={i._id} i={i} statusCfg={cfg} />;
          })}
        </ul>
      )}
    </Card>
  );
};

export default UpcomingInterviews;
