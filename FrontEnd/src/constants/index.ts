import { FileCheck, Calendar, LineChart, LayoutDashboard, Plus, UserPen, BriefcaseBusiness } from 'lucide-react'



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


 export const jobTypes = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Remote",
  ];
  export const sources = [
    "LinkedIn",
    "Indeed",
    "Company Website",
    "Referral",
    "Glassdoor",
    "AngelList",
    "Other",
  ];
  export const statuses = [
    {id:1, name: "Applied", bg:"bg-blue-500"},
    {id:2, name: "Interviewing", bg:"bg-gray-200"},
    {id:3, name:"Offer", bg:"bg-green-500"},
    {id:4, name: "Rejected", bg:"bg-red-500"},
    {id:5, name:"Waiting Response", bg:"bg-red-500"},
    {id:6, name:"Ghosted", bg:"Ghosted"}
  ];