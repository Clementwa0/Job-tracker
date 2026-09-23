import type { Interview } from "@/types/interview";
import type { InterviewCategory } from "../components/InterviewRow";

/**
 * Buckets an interview into one of the four categories shown in the
 * Interviews page tabs, stat cards, and row status chips.
 */
export const categorizeInterview = (interview: Interview, date: Date): InterviewCategory => {
  if (interview.status === "canceled") return "cancelled";
  if (interview.status === "rescheduled") return "rescheduled";
  if (["completed", "passed", "failed"].includes(interview.status)) return "completed";
  if (interview.status === "scheduled" && !isNaN(date.getTime()) && date.getTime() < Date.now()) {
    return "completed";
  }
  return "upcoming";
};
