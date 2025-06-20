import { FileCheck, Calendar, LineChart, LayoutDashboard, Plus, UserPen, BriefcaseBusiness } from 'lucide-react'

import type { 
  ApplicationStats, 
  RecentActivity, 
  Interview 
} from '@/types/job';

// Feature type definition removed because interfaces are not supported in JavaScript files.

export const features = [
  {
    id: 1,
    icon: FileCheck,
    title: 'Application Tracking',
    description: 'Keep track of all your job applications in one place. Never lose track of where you applied.',
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Interview Scheduling',
    description: 'Manage your interview schedule and never miss an important meeting or follow-up.',
  },
  {
    id: 3,
    icon: LineChart,
    title: 'Performance Analytics',
    description: 'Get insights into your job search with detailed analytics and visualization tools.',
  },
]

export const steps = [
  {
    id: 1,
    title: 'Create an account',
    description: 'Sign up for a free account to get started. No credit card required.',
    // true means content on left, number on right; false means opposite
    isContentLeft: true,
  },
  {
    id: 2,
    title: 'Add your applications',
    description: 'Log your job applications, including company, position, status, and notes.',
    isContentLeft: false,
  },
  {
    id: 3,
    title: 'Track progress',
    description: 'Update the status of your applications as you move through the interview process.',
    isContentLeft: true,
  },
  {
    id: 4,
    title: 'Get insights',
    description: 'View analytics and reports to optimize your job search strategy.',
    isContentLeft: false,
  },
]

export const login = [
              {
                icon: '📋',
                title: 'Application Management',
                desc: 'Keep track of your job applications and statuses'
              },
              {
                icon: '🔔',
                title: 'Job Alerts',
                desc: 'Get notified about new opportunities matching your profile'
              },
              {
                icon: '📊',
                title: 'Progress Reports',
                desc: 'Visualize your job search journey and milestones'
              }
            ]

export const register = [
              {
                icon: "📈",
                title: "Track Progress",
                desc: "Visualize your job hunt journey"
              },
              {
                icon: "🔔",
                title: "Smart Alerts",
                desc: "Never miss deadlines or interviews"
              },
              {
                icon: "📋",
                title: "Centralized",
                desc: "All your job data in one hub"
              }
            ]
export const user = {
  name: 'John Doe',
  email: 'john.doe@example.com'
} 

export const links = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', name: 'Jobs', icon: BriefcaseBusiness },
  { path: '/add-job', name: 'Add Job', icon: Plus },
  { path: '/calendar', name: 'Calendar', icon: Calendar },
  { path: '/profile', name: 'Profile', icon: UserPen },

]

export const recentApplications = [
  { company: "Acme Corp", position: "Frontend Developer", status: "interview", date: "2 days ago" },
  { company: "Globex Inc", position: "Product Manager", status: "applied", date: "4 days ago" },
  { company: "Stark Industries", position: "UX Designer", status: "offer", date: "1 week ago" },
]

export const mockStats: ApplicationStats = {
  total: 25,
  inProgress: 8,
  interviews: 5,
  offers: 2,
  rejections: 10
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'application',
    company: 'Google',
    position: 'Software Engineer',
    date: new Date('2024-03-15'),
    details: 'Applied to Software Engineer position'
  },
  {
    id: '2',
    type: 'interview',
    company: 'Amazon',
    position: 'Frontend Developer',
    date: new Date('2024-03-20'),
    details: 'Interview scheduled for Technical Round'
  },
  {
    id: '3',
    type: 'offer',
    company: 'Microsoft',
    position: 'Full Stack Developer',
    date: new Date('2024-03-18'),
    details: 'Received offer with competitive package'
  }
];

export const mockUpcomingInterviews: Interview[] = [
  {
    id: '1',
    company: 'Amazon',
    position: 'Frontend Developer',
    date: new Date('2024-03-20'),
    stage: 'technical',
    location: 'Virtual',
    interviewers: ['John Doe', 'Jane Smith']
  },
  {
    id: '2',
    company: 'Meta',
    position: 'Software Engineer',
    date: new Date('2024-03-22'),
    stage: 'phone_screen',
    location: 'Virtual'
  }
];


export const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Acme Corp",
    status: "Interview",
    submissionDate: "2025-06-01",
    interviewDate: "2025-06-20",
    followUpDate: "2025-06-22",
    offerDate: null,
    rejectionDate: null,
    notes: "Interview with Jane Doe",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Beta Inc",
    status: "Follow-up",
    submissionDate: "2025-06-05",
    interviewDate: null,
    followUpDate: "2025-06-18",
    offerDate: null,
    rejectionDate: null,
    notes: "Sent follow-up email",
  },
  {
    id: 3,
    title: "Full Stack Dev",
    company: "Gamma LLC",
    status: "Submitted",
    submissionDate: "2025-06-10",
    interviewDate: null,
    followUpDate: null,
    offerDate: null,
    rejectionDate: null,
    notes: "",
  },
];