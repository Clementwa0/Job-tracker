import type { Job } from "@/types";

export interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}