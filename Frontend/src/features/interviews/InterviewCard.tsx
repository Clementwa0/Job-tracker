import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Video, Pencil, Trash2 } from "lucide-react";
import type { Interview } from "@/types/interview";
import { isPopulatedJobId } from "@/types/interview";
import EditInterviewModal from "./EditInterviewModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { interviewStatus } from "@/constants";

interface Props {
  interview: Interview;
  onRefresh?: () => void;
}

const InterviewCard = ({ interview, onRefresh }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Interview | null>(null);

  const date = new Date(interview.interviewDate);
  const statusConfig = interviewStatus.find(
    (status) => status.value === interview.status,
  );
  const toSentenceCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <>
      <Card className="p-3 hover:bg-muted/40 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {toSentenceCase(interview.stage)} Interview
            </p>

            <Badge
              variant="outline"
              className={`
    text-[10px]
    uppercase
    tracking-wide
    px-2 py-0.5
    border
    font-medium
    ${statusConfig?.className}
  `}
            >
              {statusConfig?.label || interview.status}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            {isPopulatedJobId(interview.jobId)
              ? `${interview.jobId.companyName} - ${interview.jobId.jobTitle}`
              : "Job details unavailable"}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString()}
            </span>

            <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
              <Video className="h-5 w-5" />
              Join
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => {
                setSelected(interview);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2"
              onClick={() => {
                setSelected(interview);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <EditInterviewModal
        open={editOpen}
        onOpenChange={setEditOpen}
        interview={selected}
        onSuccess={onRefresh}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        interviewId={selected?._id || null}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default InterviewCard;
