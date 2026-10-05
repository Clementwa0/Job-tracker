import { Mail, UserRound, BriefcaseBusiness, Handshake, LucideIcon } from "lucide-react";

export { default as Contact } from "@/features/public/contact/Contact";



type Topic = {
  Icon: LucideIcon;
  title: string;
  copy: string;
  email: string;
  tone: string;
};

export const topics: Topic[] = [
  {
    Icon: Mail,
    title: "General",
    copy: "Questions about JobTrail?",
    email: "hello@jobtrail.com",
    tone: "from-blue-500 to-indigo-500",
  },
  {
    Icon: UserRound,
    title: "Job seekers",
    copy: "Need help finding a job?",
    email: "support@jobtrail.com",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    Icon: BriefcaseBusiness,
    title: "Employers",
    copy: "Post a job or find talent?",
    email: "employers@jobtrail.com",
    tone: "from-violet-500 to-purple-600",
  },
  {
    Icon: Handshake,
    title: "Partnerships",
    copy: "Partner or integrate with us?",
    email: "partnerships@jobtrail.com",
    tone: "from-amber-500 to-orange-500",
  },
];