import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange: string;
  applicationDate: string;
  applicationDeadline: string;
  status: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  type,
  salaryRange,
  applicationDate,
  applicationDeadline,
  status,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div
      className="p-4 border border-border rounded-lg shadow-sm bg-card cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{company}</p>
      <p className="text-sm">{location}</p>
      <p className="text-sm">{type}</p>
      <p className="text-sm">{salaryRange}</p>
      <p className="text-sm">Applied: {applicationDate}</p>
      <p className="text-sm">Deadline: {applicationDeadline}</p>
      <div className="flex justify-between items-center mt-3">
        <Badge>{status}</Badge>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}>Delete</Button>
      </div>
    </div>
  );
};

export default JobCard;