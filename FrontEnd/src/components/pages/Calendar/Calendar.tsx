import React, { useMemo, useState } from 'react';
import { useJobs } from '@/hooks/JobContext';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the event type
interface CalendarEvent {
  id: string;
  type: 'application' | 'interview' | 'follow-up' | 'offer' | 'rejection';
  date: string; // YYYY-MM-DD
  jobTitle: string;
  company: string;
  notes?: string;
}

// Helper to get all events from a job
function getJobEvents(job: any): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  if (job.date) {
    events.push({
      id: job.id + '-application',
      type: 'application',
      date: job.date,
      jobTitle: job.title,
      company: job.company,
      notes: job.notes,
    });
  }
  if (job.interviewDate) {
    events.push({
      id: job.id + '-interview',
      type: 'interview',
      date: job.interviewDate,
      jobTitle: job.title,
      company: job.company,
      notes: job.notes,
    });
  }
  if (job.followUpDate) {
    events.push({
      id: job.id + '-followup',
      type: 'follow-up',
      date: job.followUpDate,
      jobTitle: job.title,
      company: job.company,
      notes: job.notes,
    });
  }
  if (job.offerDate) {
    events.push({
      id: job.id + '-offer',
      type: 'offer',
      date: job.offerDate,
      jobTitle: job.title,
      company: job.company,
      notes: job.notes,
    });
  }
  if (job.rejectionDate) {
    events.push({
      id: job.id + '-rejection',
      type: 'rejection',
      date: job.rejectionDate,
      jobTitle: job.title,
      company: job.company,
      notes: job.notes,
    });
  }
  return events;
}

const eventTypeColor: Record<string, string> = {
  application: 'bg-blue-100 text-blue-800',
  'interview': 'bg-green-100 text-green-800',
  'follow-up': 'bg-orange-100 text-orange-800',
  'offer': 'bg-emerald-100 text-emerald-800',
  'rejection': 'bg-red-100 text-red-800',
};

const Calendar: React.FC = () => {
  const { jobs } = useJobs();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Gather all events from jobs
  const events = useMemo(() => {
    return jobs.flatMap(getJobEvents);
  }, [jobs]);

  // Map of date string to events
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      if (!event.date) continue;
      map[event.date] = map[event.date] || [];
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  // Highlight days with events
  const modifiers = useMemo(() => {
    return {
      event: Object.keys(eventsByDate).map(date => new Date(date)),
    };
  }, [eventsByDate]);

  // Events for the selected day
  const selectedDayEvents = selectedDate
    ? eventsByDate[selectedDate.toISOString().split('T')[0]] || []
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview & Job Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">See all your job-related events in one place.</p>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <UICalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersClassNames={{ event: 'bg-blue-200 dark:bg-blue-800 border-2 border-blue-500' }}
            />
          </div>
          <div className="md:w-1/2">
            <Card className="p-6 min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {selectedDate
                  ? `Events on ${selectedDate.toLocaleDateString()}`
                  : 'Select a date to see events'}
              </h2>
              {selectedDayEvents.length === 0 ? (
                <div className="text-gray-500">No events for this day.</div>
              ) : (
                <ul className="space-y-4">
                  {selectedDayEvents.map(event => (
                    <li key={event.id} className="flex items-start gap-3">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${eventTypeColor[event.type]}`}>{event.type.replace('-', ' ')}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{event.jobTitle} <span className="text-gray-500">@ {event.company}</span></div>
                        {event.notes && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.notes}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
