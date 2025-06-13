import { FileCheck, Calendar, LineChart } from 'lucide-react'
import path from 'path'

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
 {
  path: '/dashboard',
  name: 'Dashboard',
  icon: Calendar
 },
 { path: '/calendar', name: 'Calendar', icon: Calendar },
 { path: '/jobs', name: 'Jobs', icon: FileCheck },
 { path: '/profile', name: 'Profile', icon: LineChart },
 { path: '/add-job', name: 'Add Job', icon: FileCheck }
]