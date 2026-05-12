import type { Job } from "@/types";

export interface JobsTableProps {
  jobs: Job[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (job: Job) => void;
}

export type SortField =
  | "title"
  | "company"
  | "applicationDate"
  | "status";

export type SortDirection = "asc" | "desc";