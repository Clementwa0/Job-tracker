import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInterviews } from "@/hooks/useInterviews";
import InterviewCard from "@/features/interviews/InterviewCard";
import InterviewSection from "@/features/interviews/InterviewSection";
import { Calendar, Loader2, Plus } from "lucide-react";

const InterviewList = () => {
  const { interviews, loading, refetch } = useInterviews();
  const [open, setOpen] = useState(false);

  const sortedInterviews = useMemo(() => {
    return [...interviews]
      .map((i) => ({ ...i, _date: new Date(i.interviewDate) }))
      .filter((i) => !isNaN(i._date.getTime()))
      .sort((a, b) => a._date.getTime() - b._date.getTime());
  }, [interviews]);

  const grouped = useMemo(() => {
    return sortedInterviews.reduce<Record<string, typeof sortedInterviews>>((acc, iv) => {
      const key = iv.stage || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(iv);
      return acc;
    }, {});
  }, [sortedInterviews]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Interviews</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage upcoming and past interview rounds.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Schedule interview
          </Button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading interviews…</p>
          </div>
        ) : sortedInterviews.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-foreground">No interviews yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Schedule your first interview to track rounds and outcomes.
            </p>
            <Button onClick={() => setOpen(true)} size="sm">
              Schedule interview
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([stage, items]) => (
              <section key={stage}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 capitalize">
                  {stage.replace(/_/g, " ")} ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((interview) => (
                    <InterviewCard
                      key={interview._id}
                      interview={interview}
                      onRefresh={refetch}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {open && (
          <InterviewSection
            isOpen={open}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              refetch();
              setOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewList;
