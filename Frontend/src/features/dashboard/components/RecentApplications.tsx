import { Card } from "@/components/ui/card";
import { useJobs } from "@/hooks/JobContext";
import { useMemo } from "react";

const RecentApplications = () => {
  const { jobs } = useJobs();

  const recent = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      )
      .slice(0, 5);
  }, [jobs]);

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No activity
          </p>
        ) : (
          recent.map(job => (
            <div
              key={job.id}
              className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.company}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentApplications;