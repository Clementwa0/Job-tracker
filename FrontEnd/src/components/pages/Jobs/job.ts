export interface Job {
   id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange: string;
  applicationDate: string;
  applicationDeadline: string;
  status: string;
  interviews: never[];
  contactEmail: string;
  contactPhone: string;
  jobPostingUrl: string;
  notes: string;
  nextStepsDate: string;
  contactPerson: string;
  source: string;
  coverLetterFile: null;
  resumeFile: null;
  
}
