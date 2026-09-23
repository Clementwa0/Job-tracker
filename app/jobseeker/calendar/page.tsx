import { Calendar } from "@/features/jobseeker/calendar";
import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

export default function CalendarRoute() {
  return (
    <JobProvider>
      <Calendar />
    </JobProvider>
  );
}
