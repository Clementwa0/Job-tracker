import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/job";

interface JobCardProps extends Job {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  jobTitle,
  companyName,
  location,
  jobType,
  salaryRange,
  applicationDate,
  applicationDeadline,
  applicationStatus,
  resumeFile,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div
      className="p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:shadow-md transition dark:bg-gray-800"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{jobTitle}</h3>
      <p className="text-sm text-muted-foreground">{companyName}</p>
      <p className="text-sm">{location}</p>
      <p className="text-sm">{jobType}</p>
      <p className="text-sm">{salaryRange}</p>
      <p className="text-sm">Applied: {applicationDate}</p>
      <p className="text-sm">Deadline: {applicationDeadline}</p>
      {resumeFile && (
        <p className="text-sm text-muted-foreground truncate">
          {typeof resumeFile === "string" ? resumeFile : resumeFile.name}
        </p>
      )}
      <div className="flex justify-between items-center mt-3">
        <Badge>{applicationStatus}</Badge>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(id);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
