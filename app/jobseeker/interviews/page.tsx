import { InterviewList } from "@/features/jobseeker/interviews";
import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

export default function InterviewsRoute() {
  return (
    <JobProvider>
      <InterviewList />
    </JobProvider>
  );
}
