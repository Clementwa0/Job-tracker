import { jobs } from '@/constants'
import AddFollowUpModal from './FollowUp';

function getTimelineEntries(job: { id: number; title: string; company: string; status: string; submissionDate: string; interviewDate: string; followUpDate: string; offerDate: null; rejectionDate: null; notes: string; } | { id: number; title: string; company: string; status: string; submissionDate: string; interviewDate: null; followUpDate: string; offerDate: null; rejectionDate: null; notes: string; } | { id: number; title: string; company: string; status: string; submissionDate: string; interviewDate: null; followUpDate: null; offerDate: null; rejectionDate: null; notes: string; }) {
  const entries = [
    {
      date: job.submissionDate,
      label: "Application Submitted",
      status: "Submitted",
      notes: job.notes,
    },
  ];
  if (job.followUpDate)
    entries.push({
      date: job.followUpDate,
      label: "Follow-up Sent",
      status: "Follow-up",
      notes: job.notes,
    });
  if (job.interviewDate)
    entries.push({
      date: job.interviewDate,
      label: "Interview",
      status: "Interview",
      notes: job.notes,
    });
  if (job.offerDate)
    entries.push({
      date: job.offerDate,
      label: "Offer Received",
      status: "Offer",
      notes: job.notes,
    });
  if (job.rejectionDate)
    entries.push({
      date: job.rejectionDate,
      label: "Rejected",
      status: "Rejected",
      notes: job.notes,
    });
  return entries;
}

interface JobTimelineProps {
  jobId: number;
  onAddFollowUp: (jobId: number, followUpDate: string) => void;
}

export default function JobTimeline({ jobId, onAddFollowUp }: JobTimelineProps) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return <div className="text-gray-500">Job not found</div>;

  const entries = getTimelineEntries(job);

  return (
    <div className="p-4 bg-white rounded shadow dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Timeline: {job.title} @ {job.company}
      </h2>
      <ol className="relative border-l border-gray-300 dark:border-gray-700">
        {entries.map((entry, idx) => (
          <li key={idx} className="mb-8 ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full ring-8 ring-white dark:ring-gray-900"></span>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">{entry.date}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{entry.label}</span>
              {entry.notes && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{entry.notes}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4">
        <AddFollowUpModal
          job={job}
          onAdd={({ jobId, date}) => onAddFollowUp(Number(jobId), date)}
        />
      </div>
    </div>
  );
}