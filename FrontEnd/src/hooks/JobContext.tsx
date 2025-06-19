import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Job } from '@/components/pages/Jobs/JobsTable';
import { useToast } from '@/hooks/use-toast';

// Map backend job to frontend job type
function mapBackendJobToFrontend(job: any): Job {
  return {
    id: job._id,
    title: job.jobTitle || '',
    company: job.companyName || '',
    date: job.applicationDate ? new Date(job.applicationDate).toISOString().split('T')[0] : '',
    status: (job.applicationStatus || 'applied').toLowerCase(),
    priority: (job.priority || 'medium').toLowerCase(),
  };
}

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  // Fetch jobs from backend on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setJobs(data.data.map(mapBackendJobToFrontend));
        }
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to fetch jobs from backend.' });
      });
  }, []);

  // Add job
  const addJob = async (job: Omit<Job, 'id'>) => {
    // Map frontend job to backend job fields
    const backendJob = {
      jobTitle: job.title,
      companyName: job.company,
      applicationDate: job.date,
      applicationStatus: job.status,
      priority: job.priority,
    };
    try {
      const response = await fetch('http://localhost:3000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendJob),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setJobs(prev => [...prev, mapBackendJobToFrontend(result.data.job)]);
        toast({ title: 'Job added', description: `${job.title} at ${job.company} has been added.` });
      } else {
        toast({ title: 'Failed to add job', description: result.message || 'Unknown error' });
      }
    } catch (error: any) {
      toast({ title: 'Network error', description: error.message });
    }
  };

  // Update job
  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    // Map frontend fields to backend fields
    const backendJob: any = {};
    if (updatedJob.title) backendJob.jobTitle = updatedJob.title;
    if (updatedJob.company) backendJob.companyName = updatedJob.company;
    if (updatedJob.date) backendJob.applicationDate = updatedJob.date;
    if (updatedJob.status) backendJob.applicationStatus = updatedJob.status;
    if (updatedJob.priority) backendJob.priority = updatedJob.priority;
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendJob),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setJobs(prev => prev.map(job => job.id === id ? mapBackendJobToFrontend(result.data) : job));
        toast({ title: 'Job updated', description: 'The job has been successfully updated.' });
      } else {
        toast({ title: 'Failed to update job', description: result.message || 'Unknown error' });
      }
    } catch (error: any) {
      toast({ title: 'Network error', description: error.message });
    }
  };

  // Delete job
  const deleteJob = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setJobs(prev => prev.filter(job => job.id !== id));
        toast({ title: 'Job deleted', description: 'Job has been deleted.' });
      } else {
        toast({ title: 'Failed to delete job', description: result.message || 'Unknown error' });
      }
    } catch (error: any) {
      toast({ title: 'Network error', description: error.message });
    }
  };

  const getJob = (id: string) => jobs.find((job) => job.id === id);

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
