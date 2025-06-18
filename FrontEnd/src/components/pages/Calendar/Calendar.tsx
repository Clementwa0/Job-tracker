import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { jobs } from '@/constants';
import { locales } from 'zod/v4/core';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
});

const eventColors = {
  Interview: 'bg-blue-500',
  'Follow-up': 'bg-orange-400',
  Submitted: 'bg-green-500',
};

function getEventsFromJobs(jobs: any[]) {
  const events: { title: string; start: Date; end: Date; jobId: any; type: string; }[] = [];
  jobs.forEach((job: { interviewDate: string | number | Date; title: any; company: any; id: any; followUpDate: string | number | Date; submissionDate: string | number | Date; }) => {
    if (job.interviewDate) {
      events.push({
        title: `Interview: ${job.title} @ ${job.company}`,
        start: new Date(job.interviewDate),
        end: new Date(job.interviewDate),
        jobId: job.id,
        type: 'Interview',
      });
    }
    if (job.followUpDate) {
      events.push({
        title: `Follow-up: ${job.title} @ ${job.company}`,
        start: new Date(job.followUpDate),
        end: new Date(job.followUpDate),
        jobId: job.id,
        type: 'Follow-up',
      });
    }
    if (job.submissionDate) {
      events.push({
        title: `Submitted: ${job.title} @ ${job.company}`,
        start: new Date(job.submissionDate),
        end: new Date(job.submissionDate),
        jobId: job.id,
        type: 'Submitted',
      });
    }
  });
  return events;
}

interface JobCalendarProps {
  onEventClick: (jobId: any) => void;
}

export default function JobCalendar({ onEventClick }: JobCalendarProps) {
  const events = getEventsFromJobs(jobs);

  return (
    <div className="p-4 bg-white rounded shadow dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Calendar</h2>
      {events.length === 0 ? (
        <div className="text-center text-gray-500">No upcoming interviews</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={(event: { type: string | number; }) => ({
            className: `${eventColors[event.type as keyof typeof eventColors] ?? 'bg-gray-400'} text-white rounded px-2 py-1 border-none`,
            style: { border: 'none' },
          })}
          onSelectEvent={(event: { jobId: any; }) => onEventClick(event.jobId)}
        />
      )}
    </div>
  );
}