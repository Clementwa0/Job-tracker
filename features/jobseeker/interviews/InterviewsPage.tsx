"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { InterviewSection } from "./components";
import InterviewRow, { type InterviewCategory } from "./components/InterviewRow";
import InterviewsStats from "./components/InterviewsStats";
import InterviewsCalendar from "./components/InterviewsCalendar";
import InterviewsQuickActions from "./components/InterviewsQuickActions";
import InterviewTipCard from "./components/InterviewTipCard";
import { categorizeInterview } from "./utils/categorize";

type Tab = "upcoming" | "past" | "rescheduled" | "cancelled";
type SortOrder = "soonest" | "latest";

const TAB_TO_CATEGORY: Record<Tab, InterviewCategory> = {
  upcoming: "upcoming",
  past: "completed",
  rescheduled: "rescheduled",
  cancelled: "cancelled",
};

const InterviewsPage = () => {
  const { interviews, loading, refetch } = useInterviews();
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [sort, setSort] = useState<SortOrder>("soonest");

  const categorized = useMemo(() => {
    const withDate = interviews.map((i) => ({ ...i, _date: new Date(i.interviewDate) }));
    const buckets: Record<InterviewCategory, typeof withDate> = {
      upcoming: [],
      completed: [],
      rescheduled: [],
      cancelled: [],
    };
    for (const i of withDate) {
      buckets[categorizeInterview(i, i._date)].push(i);
    }
    for (const key of Object.keys(buckets) as InterviewCategory[]) {
      buckets[key].sort((a, b) =>
        sort === "soonest" ? a._date.getTime() - b._date.getTime() : b._date.getTime() - a._date.getTime()
      );
    }
    return buckets;
  }, [interviews, sort]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: categorized.upcoming.length },
    { key: "past", label: "Past", count: categorized.completed.length },
    { key: "rescheduled", label: "Rescheduled", count: categorized.rescheduled.length },
    { key: "cancelled", label: "Cancelled", count: categorized.cancelled.length },
  ];

  const activeItems = categorized[TAB_TO_CATEGORY[tab]];
  const pastPreview = tab === "upcoming" ? categorized.completed.slice(0, 1) : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Interviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your upcoming interviews, get prepared, and move closer to your dream job.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Schedule Interview
        </button>
      </header>

      <InterviewsStats />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                    tab === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              className="h-9 shrink-0 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="soonest">Sort by: Soonest</option>
              <option value="latest">Sort by: Latest</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading interviews…</p>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <CalendarIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-sm font-medium text-foreground">No interviews here yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {tab === "upcoming"
                  ? "Schedule your first interview to see it here."
                  : "Interviews in this category will show up here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map((interview) => (
                <InterviewRow
                  key={interview._id}
                  interview={interview}
                  category={TAB_TO_CATEGORY[tab]}
                  onRefresh={refetch}
                />
              ))}
            </div>
          )}

          {pastPreview.length > 0 && (
            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                  Past Interviews
                </h2>
                <button
                  type="button"
                  onClick={() => setTab("past")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {pastPreview.map((interview) => (
                  <InterviewRow key={interview._id} interview={interview} category="completed" onRefresh={refetch} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <InterviewsCalendar />
          <InterviewsQuickActions onAddInterview={() => setAddOpen(true)} />
          <InterviewTipCard />
        </div>
      </div>

      {addOpen && (
        <InterviewSection
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            refetch();
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default InterviewsPage;
