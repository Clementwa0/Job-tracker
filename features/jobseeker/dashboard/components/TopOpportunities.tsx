"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRecommendations } from "@/features/jobseeker/settings/hooks/useRecommendations";
import { labelize } from "@/lib/profile/options";

const deadlineLabel = (daysLeft: number | null) => {
  if (daysLeft === null) return "Open";
  if (daysLeft === 0) return "Closes today";
  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
};

/**
 * Personalised recommendations: open postings ranked by how well they fit the
 * user's skills, target roles, location, experience, salary and preferences.
 * Jobs already applied to (and closed ones) are filtered out by the API.
 */
const TopOpportunities = () => {
  const { data, isLoading } = useRecommendations(4);
  const jobs = data?.jobs ?? [];

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Top Job Opportunities
        </h2>
        <Link
          href="/job-board"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            {data?.ready === false
              ? "Add your skills and target roles to get jobs matched to you."
              : "No open jobs match your profile right now. Check back soon."}
          </p>
          {data?.ready === false && (
            <Link
              href="/jobseeker/settings"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              Update profile
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {jobs.map((o) => (
            <li key={o.id}>
              <Link
                href={`/job-board/${o.slug}`}
                title={o.reasons.join(" · ")}
                className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-1 px-1 rounded-md transition-colors"
              >
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {o.company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{o.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.company.name} · {o.location}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-primary">
                      {o.matchScore}% match
                    </span>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {labelize(o.jobType)}
                    </Badge>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      o.daysLeft !== null && o.daysLeft <= 7
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {deadlineLabel(o.daysLeft)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TopOpportunities;
