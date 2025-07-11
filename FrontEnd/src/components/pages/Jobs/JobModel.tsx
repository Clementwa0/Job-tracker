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
import type { Job } from "@/components/pages/Jobs/job";

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{job.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground dark:text-gray-400">
            {job.company} - {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 text-sm mt-4">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Location:</span>{" "}
            {job.location}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>{" "}
            {job.jobType}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Salary Range:</span>{" "}
            {job.salaryRange}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Applied On:</span>{" "}
            {job.applicationDate}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Deadline:</span>{" "}
            {job.applicationDeadline}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Resume:</span>{" "}
              {job.resumeFile}
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Cover Letter:</span>{" "}
              {job.coverLetterFile}
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="destructive">{job.status}</Badge>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <DialogClose asChild>
            <Button variant="outline" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
