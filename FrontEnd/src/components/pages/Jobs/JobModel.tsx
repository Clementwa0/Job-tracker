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
import type { Job } from "@/components/pages/Jobs/job"

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {job.company} {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 text-sm mt-2">
                <div>
                <strong>Location:</strong> {job.location}
                </div>
          <div>
            <strong>Type:</strong> {job.type}
          </div>
          <div>
            <strong>Salary Range:</strong> {job.salaryRange}
          </div>
          <div>
            <strong>Applied On:</strong> {job.applicationDate}
          </div>
          <div>
            <strong>Deadline:</strong> {job.applicationDeadline}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="destructive">{job.status}</Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
