import { EditJob } from "@/features/jobseeker/applications";
import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

export default function EditApplicationRoute() {
  return (
    <JobProvider>
      <EditJob />
    </JobProvider>
  );
}
