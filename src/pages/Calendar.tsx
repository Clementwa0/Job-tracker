import React, { useState } from 'react';
import PageLayout from '../components/layouts/PageLayout';
import { useJobs, Interview } from '../context/JobsContext';
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

interface InterviewWithJobDetails extends Interview {
  jobTitle: string;
  company: string;
}

const Calendar = () => {
  const { jobs } = useJobs();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get all interviews across all jobs with job details
  const getAllInterviews = (): InterviewWithJobDetails[] => {
    return jobs.reduce((allInterviews: InterviewWithJobDetails[], job) => {
      if (!job.interviews || job.interviews.length === 0) return allInterviews;
      
      const jobInterviews = job.interviews.map(interview => ({
        ...interview,
        jobTitle: job.title,
        company: job.company
      }));
      
      return [...allInterviews, ...jobInterviews];
    }, []);
  };
  
  const interviews = getAllInterviews();
  
  // Get interviews for a specific date
  const getInterviewsForDate = (date: Date): InterviewWithJobDetails[] => {
    return interviews.filter(interview => {
      return isSameDay(new Date(interview.date), date);
    });
  };
  
  // Calendar navigation handlers
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Calendar setup
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const monthFormat = "MMMM yyyy";
  
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  return (
    <PageLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-xl md:text-2xl font-bold">Interview Calendar</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-w-[80px]"
            >
              Previous
            </button>
            <button
              onClick={goToToday}
              className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-w-[80px]"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-w-[80px]"
            >
              Next
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-border">
          <div className="bg-primary/5 px-4 md:px-6 py-3 border-b border-border">
            <h2 className="text-base md:text-lg font-semibold text-center">
              {format(currentMonth, monthFormat)}
            </h2>
          </div>
          
          {/* Day names - Hide on mobile, show abbreviated version */}
          <div className="hidden sm:grid grid-cols-7 text-center text-xs uppercase font-semibold text-gray-500 border-b border-border">
            <div className="py-2">Sun</div>
            <div className="py-2">Mon</div>
            <div className="py-2">Tue</div>
            <div className="py-2">Wed</div>
            <div className="py-2">Thu</div>
            <div className="py-2">Fri</div>
            <div className="py-2">Sat</div>
          </div>
          
          {/* Mobile day names */}
          <div className="grid grid-cols-7 text-center text-[10px] uppercase font-semibold text-gray-500 border-b border-border sm:hidden">
            <div className="py-1">S</div>
            <div className="py-1">M</div>
            <div className="py-1">T</div>
            <div className="py-1">W</div>
            <div className="py-1">T</div>
            <div className="py-1">F</div>
            <div className="py-1">S</div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayInterviews = getInterviewsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[120px] border-b border-r border-gray-200 p-1 md:p-2 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-right text-sm mb-1 ${
                    isToday ? 'font-bold text-primary' : ''
                  }`}>
                    {format(day, dateFormat)}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[60px] md:max-h-[100px]">
                    {dayInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="text-[10px] md:text-xs bg-primary/10 text-primary p-1 rounded truncate"
                      >
                        <div className="font-medium">{interview.time}</div>
                        <div className="hidden sm:block truncate">{interview.jobTitle}</div>
                        <div className="hidden sm:block text-[10px] text-gray-600 truncate">
                          {interview.company}
                        </div>
                        {/* Mobile view - compact display */}
                        <div className="sm:hidden truncate">
                          {interview.jobTitle.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Interviews List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-border">
          <div className="bg-primary/5 px-4 md:px-6 py-3 border-b border-border">
            <h2 className="text-base md:text-lg font-semibold">Upcoming Interviews</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {interviews
              .filter(interview => new Date(interview.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(interview => (
                <div key={interview.id} className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="shrink-0 bg-primary/10 rounded-full p-2 md:p-3">
                      <CalendarIcon size={16} className="text-primary md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm md:text-base truncate">{interview.jobTitle}</h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{interview.company}</p>
                      <div className="mt-1 text-xs md:text-sm">
                        <span className="font-medium">
                          {format(new Date(interview.date), 'MMM d, yyyy')} at {interview.time}
                        </span> 
                        <span className="text-gray-500 ml-2">({interview.type})</span>
                      </div>
                      {interview.notes && (
                        <p className="mt-2 text-xs md:text-sm text-gray-600 line-clamp-2">{interview.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
            {interviews.filter(interview => new Date(interview.date) >= new Date()).length === 0 && (
              <div className="px-4 md:px-6 py-6 md:py-8 text-center">
                <p className="text-sm md:text-base text-gray-500">No upcoming interviews scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Calendar;
