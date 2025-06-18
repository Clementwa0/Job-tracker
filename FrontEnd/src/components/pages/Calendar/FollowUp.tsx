import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

type AddFollowUpModalProps = {
  job: { id: string | number; [key: string]: any };
  onAdd: (followUp: { jobId: string | number; date: string; note: string }) => void;
};

export default function AddFollowUpModal({ job, onAdd }: AddFollowUpModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    onAdd({ jobId: job.id, date, note });
    setOpen(false);
    setDate('');
    setNote('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          Add Follow-Up
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">Add Follow-Up Reminder</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                rows={3}
                placeholder="Optional note"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button type="button" className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}