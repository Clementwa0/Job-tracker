import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInterviews } from "@/hooks/useInterviews";
import { isPopulatedJobId } from "@/types/interview";
import { Clock, Video } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { interviewStatus } from "@/constants";

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
          i.status !== "cancelled"
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [interviews]);

  const toSentenceCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Upcoming Interviews
      </h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
<ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No interviews scheduled
            </p>
          ) : (
            sorted.map((i) => {
              const statusConfig = interviewStatus.find(
                (status) => status.value === i.status
              );

              return (
                <li
                  key={i._id}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-background/50
                    p-3
                    transition-all
                    hover:bg-muted/50
                    hover:shadow-sm
                  "
                >
                  <Link to="/interviews" className="block space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {toSentenceCase(i.stage)} Interview
                      </p>

                      <Badge
                        variant="outline"
                        className={`
                          text-[10px]
                          uppercase
                          tracking-wide
                          font-medium
                          border
                          rounded-full
                          px-2 py-0.5
                          ${statusConfig?.className}
                        `}
                      >
                        {statusConfig?.label || i.status}
                      </Badge>
                    </div>

                    {/* Job info */}
                    <p className="text-xs text-muted-foreground">
                      {isPopulatedJobId(i.jobId)
                        ? `${i.jobId.companyName} — ${i.jobId.jobTitle}`
                        : "Job details unavailable"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {i.date.toLocaleString()}
                      </span>

                      <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      )}
    </Card>
  );
};

export default UpcomingInterviews;