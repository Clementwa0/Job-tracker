
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

// Define job types
export type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  salary: string;
  contact: string;
  notes: string;
  status: JobStatus;
  dateApplied?: string;
  dateCreated: string;
  dateModified: string;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  jobId: string;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person' | 'other';
  notes: string;
}

// Define actions for reducer
type JobAction =
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: Job }
  | { type: 'DELETE_JOB'; payload: string }
  | { type: 'ADD_INTERVIEW'; payload: { jobId: string; interview: Interview } }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' };

// Define state for context
interface JobsState {
  jobs: Job[];
  isLoading: boolean;
}

// Define context type
interface JobsContextType {
  jobs: Job[];
  isLoading: boolean;
  getJobs: () => Promise<void>;
  getJobsByStatus: (status: JobStatus) => Job[];
  getJobById: (id: string) => Job | undefined;
  addJob: (job: Omit<Job, 'id' | 'dateCreated' | 'dateModified'>) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  addInterview: (jobId: string, interview: Omit<Interview, 'id'>) => Promise<void>;
}

// Create context
const JobsContext = createContext<JobsContextType | null>(null);

// Custom hook to use the context
export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

// Reducer function
const jobsReducer = (state: JobsState, action: JobAction): JobsState => {
  switch (action.type) {
    case 'SET_JOBS':
      return {
        ...state,
        jobs: action.payload,
      };
    case 'ADD_JOB':
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
      };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.id ? action.payload : job
        ),
      };
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter((job) => job.id !== action.payload),
      };
    case 'ADD_INTERVIEW':
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id === action.payload.jobId) {
            return {
              ...job,
              interviews: [...(job.interviews || []), action.payload.interview],
            };
          }
          return job;
        }),
      };
    case 'LOADING_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOADING_END':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Mock data for initial state
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Innovators Inc',
    location: 'San Francisco, CA (Remote)',
    url: 'https://example.com/job/1',
    description: 'Looking for an experienced frontend developer to join our team.',
    salary: '$120,000 - $150,000',
    contact: 'hr@techinnovators.com',
    notes: 'Initial application submitted via company website.',
    status: 'applied',
    dateApplied: '2025-05-15',
    dateCreated: '2025-05-10',
    dateModified: '2025-05-15',
    interviews: [
      {
        id: '101',
        jobId: '1',
        date: '2025-05-25',
        time: '10:00',
        type: 'video',
        notes: 'Initial screening with HR'
      }
    ]
  },
  {
    id: '2',
    title: 'Senior Software Engineer',
    company: 'DataSphere Solutions',
    location: 'New York, NY',
    url: 'https://example.com/job/2',
    description: 'Senior role focused on building scalable cloud solutions.',
    salary: '$140,000 - $160,000',
    contact: 'careers@datasphere.co',
    notes: 'Referred by John from Marketing.',
    status: 'saved',
    dateCreated: '2025-05-12',
    dateModified: '2025-05-12'
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Minds Studio',
    location: 'Austin, TX (Hybrid)',
    url: 'https://example.com/job/3',
    description: 'Looking for a creative designer to improve our product experience.',
    salary: '$90,000 - $110,000',
    contact: 'design@creativeminds.com',
    notes: 'Portfolio review required.',
    status: 'interview',
    dateApplied: '2025-05-01',
    dateCreated: '2025-04-28',
    dateModified: '2025-05-18',
    interviews: [
      {
        id: '102',
        jobId: '3',
        date: '2025-05-15',
        time: '14:00',
        type: 'video',
        notes: 'Initial interview with design team lead'
      },
      {
        id: '103',
        jobId: '3',
        date: '2025-05-23',
        time: '11:00',
        type: 'in-person',
        notes: 'Second interview with design team and product manager'
      }
    ]
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'WebSolutions Pro',
    location: 'Remote',
    url: 'https://example.com/job/4',
    description: 'Full stack role with focus on Node.js and React.',
    salary: '$110,000 - $130,000',
    contact: 'jobs@websolutionspro.com',
    notes: 'Technical assessment required after initial interview.',
    status: 'offer',
    dateApplied: '2025-04-20',
    dateCreated: '2025-04-15',
    dateModified: '2025-05-20'
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudNative Technologies',
    location: 'Seattle, WA',
    url: 'https://example.com/job/5',
    description: 'Managing cloud infrastructure and CI/CD pipelines.',
    salary: '$130,000 - $150,000',
    contact: 'recruitment@cloudnative.com',
    notes: 'Position requires 3+ years of AWS experience.',
    status: 'rejected',
    dateApplied: '2025-04-25',
    dateCreated: '2025-04-22',
    dateModified: '2025-05-18'
  },
  {
    id: '6',
    title: 'Mobile App Developer',
    company: 'AppGenius Labs',
    location: 'Boston, MA (Hybrid)',
    url: 'https://example.com/job/6',
    description: 'Developing cross-platform mobile applications using React Native.',
    salary: '$100,000 - $125,000',
    contact: 'hiring@appgeniuslabs.com',
    notes: 'Looking for someone with experience in both iOS and Android development.',
    status: 'accepted',
    dateApplied: '2025-04-10',
    dateCreated: '2025-04-05',
    dateModified: '2025-05-10'
  }
];

export const JobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jobsReducer, {
    jobs: [],
    isLoading: false,
  });

  useEffect(() => {
    getJobs();
  }, []);

  // Get all jobs
  const getJobs = async () => {
    try {
      dispatch({ type: 'LOADING_START' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      dispatch({ type: 'SET_JOBS', payload: mockJobs });
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      dispatch({ type: 'LOADING_END' });
    }
  };

  // Get jobs by status
  const getJobsByStatus = (status: JobStatus) => {
    return state.jobs.filter(job => job.status === status);
  };

  // Get job by ID
  const getJobById = (id: string) => {
    return state.jobs.find(job => job.id === id);
  };

  // Add a new job
  const addJob = async (jobData: Omit<Job, 'id' | 'dateCreated' | 'dateModified'>) => {
    try {
      dispatch({ type: 'LOADING_START' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date().toISOString();
      const newJob: Job = {
        ...jobData,
        id: `job-${Date.now()}`,
        dateCreated: now,
        dateModified: now,
      };
      
      dispatch({ type: 'ADD_JOB', payload: newJob });
      toast.success('Job added successfully');
    } catch (error) {
      toast.error('Failed to add job');
      console.error(error);
    } finally {
      dispatch({ type: 'LOADING_END' });
    }
  };

  // Update an existing job
  const updateJob = async (job: Job) => {
    try {
      dispatch({ type: 'LOADING_START' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedJob: Job = {
        ...job,
        dateModified: new Date().toISOString(),
      };
      
      dispatch({ type: 'UPDATE_JOB', payload: updatedJob });
      toast.success('Job updated successfully');
    } catch (error) {
      toast.error('Failed to update job');
      console.error(error);
    } finally {
      dispatch({ type: 'LOADING_END' });
    }
  };

  // Delete a job
  const deleteJob = async (id: string) => {
    try {
      dispatch({ type: 'LOADING_START' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'DELETE_JOB', payload: id });
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error('Failed to delete job');
      console.error(error);
    } finally {
      dispatch({ type: 'LOADING_END' });
    }
  };

  // Add an interview to a job
  const addInterview = async (jobId: string, interviewData: Omit<Interview, 'id'>) => {
    try {
      dispatch({ type: 'LOADING_START' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const interview: Interview = {
        ...interviewData,
        id: `interview-${Date.now()}`,
        jobId,
      };
      
      dispatch({ type: 'ADD_INTERVIEW', payload: { jobId, interview } });
      toast.success('Interview added successfully');
    } catch (error) {
      toast.error('Failed to add interview');
      console.error(error);
    } finally {
      dispatch({ type: 'LOADING_END' });
    }
  };

  return (
    <JobsContext.Provider
      value={{
        jobs: state.jobs,
        isLoading: state.isLoading,
        getJobs,
        getJobsByStatus,
        getJobById,
        addJob,
        updateJob,
        deleteJob,
        addInterview,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};
