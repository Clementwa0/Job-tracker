
import React, { createContext, useState, useContext } from 'react';
import type { Job } from '@/components/pages/Jobs/JobsTable';
import { useToast } from '@/hooks/use-toast';

// Sample job data for demonstration
const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc.',
    date: '2023-05-15',
    status: 'interviewed',
    priority: 'high',
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Creative Studios',
    date: '2023-05-10',
    status: 'applied',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'Innovate Labs',
    date: '2023-05-05',
    status: 'offered',
    priority: 'high',
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'Startup Co.',
    date: '2023-04-28',
    status: 'rejected',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    date: '2023-04-22',
    status: 'applied',
    priority: 'low',
  },
];

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const { toast } = useToast();
  
  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = {
      ...job,
      id: Date.now().toString(),
    };
    
    setJobs((prevJobs) => [...prevJobs, newJob]);
    toast({
      title: "Job added",
      description: `${job.title} at ${job.company} has been added.`,
    });
  };
  
  const updateJob = (id: string, updatedJob: Partial<Job>) => {
    setJobs((prevJobs) => 
      prevJobs.map((job) => 
        job.id === id ? { ...job, ...updatedJob } : job
      )
    );
    toast({
      title: "Job updated",
      description: "The job has been successfully updated.",
    });
  };
  
  const deleteJob = (id: string) => {
    const jobToDelete = jobs.find(job => job.id === id);
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    toast({
      title: "Job deleted",
      description: jobToDelete 
        ? `${jobToDelete.title} at ${jobToDelete.company} has been removed.` 
        : "Job has been deleted.",
    });
  };
  
  const getJob = (id: string) => {
    return jobs.find((job) => job.id === id);
  };
  
  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob, getJob }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
