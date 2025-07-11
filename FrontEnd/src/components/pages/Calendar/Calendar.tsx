import { useState, type Key, type ReactNode } from 'react';
import { useJobs } from "@/hooks/JobContext";
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import type { Interview } from '@/types/job';
import { Button } from '@/components/ui/button';

interface InterviewWithJobDetails extends Interview {
  date: Date;
  id: string;
  time: ReactNode;
  type: ReactNode;
  notes: any;
  jobTitle: string;
  company: string;
}

const Calendar = () => {
  const { jobs } = useJobs();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const interviews: InterviewWithJobDetails[] = jobs.flatMap((job) =>
    (job.interviews || []).map((interview: any) => ({
      ...interview,
      jobTitle: job.title,
      company: job.company,
    }))
  );

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(interview =>
      isSameDay(new Date(interview.date), date)
    );
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 dark:bg-gray-900 dark:border-gray-100 dark:text-gray-100" >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Calendar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-100">Track and view all your interviews by date.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={previousMonth} className="px-3 py-2 border rounded text-sm dark:text-gray-100" >←</Button>
            <Button onClick={goToToday} className="px-3 py-2 bg-primary text-white rounded text-sm dark:text-gray-100 dark:bg-gray-900">Today</Button>
            <Button onClick={nextMonth} className="px-3 py-2 border rounded text-sm dark:text-gray-100">→</Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border rounded-lg overflow-hidden shadow dark:bg-gray-900 dark:text-white">
        <div className="bg-primary/5 text-center py-3 text-lg font-medium border-b">
          {format(currentMonth, 'MMMM yyyy')}
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 text-xs font-semibold text-center text-gray-500 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const dailyInterviews = getInterviewsForDate(day);

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-r border-b relative ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400 dark:bg-gray-700' : ''
                } ${isToday ? 'bg-primary/10 dark:bg-gray-500' : ''}`}
              >
                <div className={`text-right text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>

                <div className="mt-2 space-y-1 max-h-[80px] overflow-y-auto">
                  {dailyInterviews.map(interview => (
                    <div
                      key={interview.id}
                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded leading-tight truncate"
                    >
                      <div>{interview.time} – {interview.jobTitle}</div>
                      <div className="text-[10px] text-gray-600">{interview.company}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-lg border shadow dark:bg-gray-900">
        <div className="bg-primary/5 py-3 px-4 border-b">
          <h2 className="text-base font-semibold">Upcoming Interviews</h2>
        </div>
        <div className="divide-y">
          {interviews
            .filter(i => new Date(i.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(interview => (
              <div key={interview.id} className="px-4 py-3 flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CalendarIcon size={16} className="text-primary" />
                </div>
                <div>
                  <div className="font-medium">{interview.jobTitle}</div>
                  <div className="text-sm text-gray-500">{interview.company}</div>
                  <div className="text-xs mt-1">
                    {format(new Date(interview.date), 'MMM d, yyyy')} at {interview.time}
                    <span className="ml-2 text-gray-400">({interview.type})</span>
                  </div>
                  {interview.notes && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{interview.notes}</p>
                  )}
                </div>
              </div>
            ))}

          {interviews.filter(i => new Date(i.date) >= new Date()).length === 0 && (
            <div className="text-center px-6 py-8 text-sm text-gray-500">
              No upcoming interviews found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
