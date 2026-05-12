import {
  FileCheck,
  Calendar,
  LineChart,
  BriefcaseBusiness,
  TrendingUp,
  Bell,
  LayoutDashboard,
  Plus,
  FileText,
  BarChart3,
  CheckCircle,
  Target,
  ShieldCheck
} from "lucide-react";


export const register = [
  {
    icon: BriefcaseBusiness,
    title: "Track Applications",
    desc: "Organize all your job applications in one place",
  },
  {
    icon: Calendar,
    title: "Interview Scheduler",
    desc: "Never miss an interview with smart reminders",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    desc: "Visualize your job search performance",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Get notified about application updates",
  },
];


export const loginFeatures = [
  {
    icon: FileText,
    title: "Application Management",
    description: "Keep track of your job applications and statuses",
  },
  {
    icon: Bell,
    title: "Job Alerts",
    description: "Get notified about new opportunities matching your profile",
  },
  {
    icon: BarChart3,
    title: "Progress Reports",
    description: "Visualize your job search journey and milestones",
  },
];

 export const feedbackCategories = [
    {
      id: "formatting",
      key: "formatting_and_structure",
      title: "Formatting & Structure",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "grammar",
      key: "grammar_and_clarity",
      title: "Grammar & Clarity",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "skills",
      key: "skills_match",
      title: "Skills Match",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "achievements",
      key: "achievements_and_impact",
      title: "Achievements & Impact",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "compatibility",
      key: "ats_compatibility",
      title: "ATS Compatibility",
      icon:ShieldCheck,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];