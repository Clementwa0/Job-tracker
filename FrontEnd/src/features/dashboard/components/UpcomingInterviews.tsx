import { Card } from "@/components/ui/card";
import { useJobs } from "@/hooks/JobContext";
import { useMemo } from "react";

const UpcomingInterviews = () => {
  const { jobs } = useJobs();

  const interviews = useMemo(() => {
    return jobs
      .filter(j => j.status === "interviewing" && j.interviews?.length)
      .map(j => ({
        ...j,
        date: new Date(j.interviews[0]),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [jobs]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>

      <div className="space-y-3">
        {interviews.length === 0 ? (
          <p className="text-gray-500">No interviews</p>
        ) : (
          interviews.map(i => (
            <div key={i.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{i.title}</p>
                <p className="text-sm text-gray-500">{i.company}</p>
              </div>
              <span className="text-sm">{i.date.toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default UpcomingInterviews;