import {
  BriefcaseBusiness,
  Calendar,
  LineChart,
  Bell,
  Target,
  Zap,
} from "lucide-react";

export const features = [
  {
    icon: BriefcaseBusiness,
    title: "Application tracking",
    description:
      "Keep every role, status, and note in one place so nothing slips through.",
  },
  {
    icon: Calendar,
    title: "Interview rhythm",
    description:
      "See deadlines and interviews at a glance and stay ahead of follow-ups.",
  },
  {
    icon: LineChart,
    title: "Clear progress",
    description:
      "Spot bottlenecks in your search and adjust where it matters most.",
  },
  {
    icon: Bell,
    title: "Timely reminders",
    description:
      "Nudge yourself before deadlines so you respond while roles are still warm.",
  },
  {
    icon: Target,
    title: "Focused pipeline",
    description:
      "Prioritize high-fit roles and spend energy where returns are highest.",
  },
  {
    icon: Zap,
    title: "Fast workflows",
    description:
      "Move from discovery to application with fewer clicks and less friction.",
  },
];

export const steps = [
  {
    title: "Create your workspace",
    description:
      "Sign up and set up your profile so applications stay tied to you.",
  },
  {
    title: "Add applications",
    description:
      "Log roles as you apply—titles, companies, dates, and status in seconds.",
  },
  {
    title: "Iterate and improve",
    description:
      "Review analytics, tune your approach, and land offers faster.",
  },
];

export const recentApplications = [
  { position: "Frontend Engineer", company: "Northwind", date: "Today" },
  { position: "Product Designer", company: "Contoso", date: "Yesterday" },
  { position: "Data Analyst", company: "Fabrikam", date: "3d ago" },
];
