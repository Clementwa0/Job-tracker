import type { Job } from "@/types";
import type { SortDirection, SortField } from "./jobs-table.types";

export function sortJobs(
  jobs: Job[],
  field: SortField,
  direction: SortDirection
) {
  return [...jobs].sort((a, b) => {
    const aValue = a[field] ?? "";
    const bValue = b[field] ?? "";

    if (field === "applicationDate") {
      return direction === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }

    return direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
}