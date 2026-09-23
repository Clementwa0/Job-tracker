"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useProfile } from "@/features/jobseeker/settings/hooks/useProfile";
import { labelize } from "@/lib/profile/options";

function topValues(values: string[], limit = 2) {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([v]) => v);
}

const JobPreferencesCard = () => {
  const { jobs } = useJobs();
  const { profile } = useProfile();

  // The preferences the user saved in Settings win; until they set some, fall
  // back to what their tracked applications suggest (the previous behaviour).
  const prefs = useMemo(() => {
    const saved = profile?.profile;

    const roles = saved?.targetRoles.length
      ? saved.targetRoles.slice(0, 2)
      : topValues(jobs.map((j) => j.jobTitle));

    const locations = saved?.preferredLocations.length
      ? saved.preferredLocations.slice(0, 2)
      : saved?.location
        ? [saved.location]
        : topValues(jobs.map((j) => j.location));

    const types = saved?.preferredJobTypes.length
      ? saved.preferredJobTypes.map(labelize)
      : topValues(jobs.map((j) => j.jobType), 1);

    return {
      roles: roles.length ? roles.join(" · ") : "Not set yet",
      location: locations.length ? locations.join(" · ") : "Not set yet",
      type: types.length ? types.join(" · ") : "Not set yet",
    };
  }, [jobs, profile]);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">Job Preferences</h2>
        <Link
          href="/jobseeker/settings"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="space-y-3 text-xs">
        <li className="flex items-start gap-2.5">
          <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-muted-foreground">Target roles</p>
            <p className="truncate font-medium text-foreground">{prefs.roles}</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-muted-foreground">Location</p>
            <p className="truncate font-medium text-foreground">{prefs.location}</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-muted-foreground">Employment type</p>
            <p className="truncate font-medium text-foreground">{prefs.type}</p>
          </div>
        </li>
      </ul>
    </Card>
  );
};

export default JobPreferencesCard;
