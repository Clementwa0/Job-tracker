import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { interviewService } from "@/services/interviewService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string | null;
  onSuccess?: () => void;
}

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  interviewId,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!interviewId) return;

    try {
      setLoading(true);

      await interviewService.deleteInterview(interviewId);

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The interview will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;