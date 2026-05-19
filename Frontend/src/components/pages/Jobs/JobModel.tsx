import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/job";
import type { Interview } from "@/types";

interface JobModalProps {
  job: Job | null;
  interviews?: Interview[];
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({
  job,
  interviews = [],
  onClose,
}) => {
  if (!job) return null;

  const resumeUrl =
    typeof job.resumeFile === "string" && job.resumeFile
      ? job.resumeFile.startsWith("http")
        ? job.resumeFile
        : `${import.meta.env.VITE_API_DB_URL?.replace(
            /\/api\/?$/,
            ""
          )}${job.resumeFile}`
      : null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-border dark:border-gray-700">

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {job.jobTitle}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground dark:text-gray-400">
            {job.companyName} - {job.location}
          </DialogDescription>
        </DialogHeader>

        {/* JOB DETAILS */}
        <div className="grid gap-3 text-sm mt-4">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Location:
            </span>{" "}
            {job.location}
          </div>

          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Type:
            </span>{" "}
            {job.jobType}
          </div>

          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Salary Range:
            </span>{" "}
            {job.salaryRange}
          </div>

          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Applied On:
            </span>{" "}
            {job.applicationDate}
          </div>

          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Deadline:
            </span>{" "}
            {job.applicationDeadline}
          </div>

          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Resume:
            </span>{" "}
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Resume
              </a>
            ) : (
              <span className="text-gray-400">Not uploaded</span>
            )}
          </div>

          <Badge variant="destructive">
            {job.applicationStatus}
          </Badge>
        </div>

        {/* INTERVIEWS */}
        {interviews.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Interviews ({interviews.length})
            </p>

            <div className="space-y-2">
              {interviews.map((i) => {
                const d = i.interviewDate
                  ? new Date(i.interviewDate)
                  : null;

                return (
                  <div
                    key={i._id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    {d && (
                      <div className="flex flex-col items-center justify-center rounded bg-primary px-2.5 py-1 text-primary-foreground">
                        <span className="text-[10px] font-bold uppercase">
                          {d.toLocaleString("en", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-base font-bold">
                          {d.getDate()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold capitalize">
                        {i.stage} interview
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {d
                          ? d.toLocaleTimeString("en", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                          : "No date"}
                        {i.location ? ` • ${i.location}` : ""} •{" "}
                        <span className="capitalize">
                          {i.status}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLOSE BUTTON */}
        <div className="flex justify-end pt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;