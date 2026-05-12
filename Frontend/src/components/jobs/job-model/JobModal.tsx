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

import type { JobModalProps } from "./job-modal.types";
import { getResumeUrl } from "./job-modal.utils";

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  const resumeUrl = getResumeUrl(job);

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl dark:bg-gray-900">

        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
          <DialogDescription>
            {job.company} • {job.location}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-2 text-sm mt-4">

          <p><b>Location:</b> {job.location}</p>
          <p><b>Type:</b> {job.jobType}</p>
          <p><b>Salary:</b> {job.salaryRange}</p>
          <p><b>Applied:</b> {job.applicationDate}</p>
          <p><b>Deadline:</b> {job.applicationDeadline}</p>

          <p>
            <b>Resume:</b>{" "}
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                View Resume
              </a>
            ) : (
              <span className="text-gray-400">Not uploaded</span>
            )}
          </p>

          <div className="pt-2">
            <Badge>{job.status}</Badge>
          </div>

        </div>

        {/* Footer */}
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