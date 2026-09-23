import { Analytics } from "@/features/jobseeker/analytics";
import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

export default function AnalyticsRoute() {
  return (
    <JobProvider>
      <Analytics />
    </JobProvider>
  );
}
