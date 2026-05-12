import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Job } from "@/types";

interface Props {
  job: Job | null;
  onClose: () => void;
}

const CalendarModal: React.FC<Props> = ({ job, onClose }) => {
  return (
    <Dialog.Root
      open={!!job}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />

        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-xl">
          
          <div className="flex justify-between mb-4">
            <Dialog.Title className="font-bold">
              {job?.title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button aria-label="Close">
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          <div className="text-sm space-y-2">
            <p><strong>Company:</strong> {job?.company}</p>
            <p><strong>Status:</strong> {job?.status}</p>

            <p>
              <strong>Applied:</strong>{" "}
              {job?.applicationDate
                ? new Date(job.applicationDate).toLocaleDateString()
                : "N/A"}
            </p>

            <p>
              <strong>Deadline:</strong>{" "}
              {job?.applicationDeadline
                ? new Date(job.applicationDeadline).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CalendarModal;