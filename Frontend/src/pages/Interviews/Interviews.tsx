import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInterviews } from "@/hooks/useInterviews";
import InterviewCard from "@/features/interviews/InterviewCard";
import InterviewSection from "@/features/interviews/InterviewSection";
import type { Interview } from "@/types/interview";
import { toast } from "sonner";

const InterviewList = () => {
  const { interviews, loading, refetch } = useInterviews();
  const [open, setOpen] = useState(false);

  const sortedInterviews = useMemo(() => {
    return [...interviews]
      .map((i) => ({ ...i, _date: new Date(i.interviewDate) }))
      .filter((i: any) => !isNaN(i._date.getTime()))
      .sort((a: any, b: any) => a._date.getTime() - b._date.getTime());
  }, [interviews]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Interviews</h2>

        <Button onClick={() => setOpen(true)}>
          Add Interview
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : sortedInterviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No interviews found
        </p>
      ) : (
        <div className="space-y-3 ">
          {sortedInterviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}

      {open && (
        <InterviewSection
          isOpen={open}
          onClose={() => setOpen(false)}
          onSuccess={(newInterview?: Interview) => {
            setOpen(false);

            if (newInterview) {
              toast.success("Interview created");
              refetch();
            }
          }}
        />
      )}
    </Card>
  );
};

export default InterviewList;