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
  resumeFile: string | null;
  coverLetterFile: string | null;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  jobPostingUrl: string;
  source: string;
  notes: string;
  interviews: {
    date: string;
    type: string;
    notes: string;
  }[];
  nextStepsDate?: string; // ✅ optional, so older jobs won’t break
}
