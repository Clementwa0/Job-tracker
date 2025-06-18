export type ApplicationStatus = 
  | 'applied' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected' 
  | 'accepted';

export type InterviewStage = 
  | 'phone_screen' 
  | 'technical' 
  | 'hr' 
  | 'onsite' 
  | 'final';

export interface Interview {
  id: string;
  company: string;
  position: string;
  date: Date;
  stage: InterviewStage;
  notes?: string;
  location?: string;
  interviewers?: string[];
}

export interface JobApplication {
  applicationDate: string | number | Date;
  applicationStatus: any;
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: Date;
  lastUpdated: Date;
  interviews?: Interview[];
  notes?: string;
  salary?: number;
  location?: string;
  jobUrl?: string;
  followUpDate?: Date;
  reminder?: string;
}

export interface ApplicationStats {
  total: number;
  inProgress: number;
  interviews: number;
  offers: number;
  rejections: number;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejection';
  company: string;
  position: string;
  date: Date;
  details?: string;
} 