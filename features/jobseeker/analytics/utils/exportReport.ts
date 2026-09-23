import type { Job } from "@/types/job";

const escapeCsv = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export function exportJobsAsCsv(jobs: Job[], filename = "jobtrail-analytics-report.csv") {
  const headers = [
    "Company",
    "Position",
    "Applied Date",
    "Status",
    "Match Score",
    "Source",
    "Location",
    "Job Type",
  ];

  const rows = jobs.map((job) => [
    job.companyName,
    job.jobTitle,
    job.applicationDate ? new Date(job.applicationDate).toLocaleDateString() : "",
    job.applicationStatus,
    typeof job.matchScore === "number" ? `${job.matchScore}%` : "",
    job.source || "",
    job.location || "",
    job.jobType || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
