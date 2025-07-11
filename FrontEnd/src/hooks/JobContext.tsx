import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Job } from '@/components/pages/Jobs/JobsTable';
import { useToast } from '@/hooks/use-toast';
import API from '@/lib/axios';

function mapBackendJobToFrontend(job: any): Job {
return {
  id: job._id,
  title: job.jobTitle || '',
  company: job.companyName || '',
  location: job.location || '',
  jobType: job.jobType || '',
  salaryRange: job.salaryRange || '',
  applicationDate: job.applicationDate ? new Date(job.applicationDate).toISOString().split('T')[0] : '',
  applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
  status: (job.applicationStatus || 'applied').toLowerCase(),
  resumeFile: job.resumeFile,
  coverLetterFile: job.coverLetterFile,
  interviews: [],
  contactEmail: '',
  contactPhone: '',
  jobPostingUrl: '',
  notes: '',
  nextStepsDate: '',
  contactPerson: '',
  source: ''
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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        if (res.data.success) {
          setJobs(res.data.data.map(mapBackendJobToFrontend));
        }
      } catch (error: any) {
        toast({
          title: 'Error loading jobs',
          description: error.response?.data?.message || 'Something went wrong.'
        });
      }
    };

    fetchJobs();
  }, []);

  const addJob = async (job: Omit<Job, 'id'>) => {
    const backendJob = {
      jobTitle: job.title,
      companyName: job.company,
      applicationDate: job.applicationDate,
      applicationDeadline: job.applicationDeadline,
      applicationStatus: job.status,
      jobType: job.jobType,
    };

    try {
      const res = await API.post('/jobs', backendJob);
      if (res.data.success) {
        setJobs(prev => [...prev, mapBackendJobToFrontend(res.data.data.job)]);
        toast({ title: 'Job added', description: `${job.title} at ${job.company}` });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to add job',
        description: error.response?.data?.message || error.message
      });
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    const backendJob: any = {};
    if (updatedJob.title) backendJob.jobTitle = updatedJob.title;
    if (updatedJob.company) backendJob.companyName = updatedJob.company;
    if (updatedJob.applicationDate) backendJob.applicationDate = updatedJob.applicationDate;
    if (updatedJob.applicationDeadline) backendJob.applicationDeadline = updatedJob.applicationDeadline;
    if (updatedJob.status) backendJob.applicationStatus = updatedJob.status;
    if (updatedJob.jobType) backendJob.jobType = updatedJob.jobType;

    try {
      const res = await API.put(`/jobs/${id}`, backendJob);
      if (res.data.success) {
        setJobs(prev => prev.map(job => job.id === id ? mapBackendJobToFrontend(res.data.data) : job));
        toast({ title: 'Job updated', description: 'Update successful.' });
      }
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message
      });
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const res = await API.delete(`/jobs/${id}`);
      if (res.data.success) {
        setJobs(prev => prev.filter(job => job.id !== id));
        toast({ title: 'Job deleted', description: 'The job has been removed.' });
      }
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || error.message
      });
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
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
