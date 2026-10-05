import { Brain, BriefcaseBusiness, Compass, FileCheck2, FileText, LucideIcon, Settings2, Target, TrendingUp, UsersRound } from "lucide-react";

export { default as AboutPage } from "@/features/public/homepage/components/About";
export { default as HeroSection } from "@/features/public/homepage/components/HeroSection";
export { default as LandingPreview } from "@/features/public/homepage/components/LandingPreview";


export const milestones = [
  {
    n: "01",
    title: "DISCOVER",
    text: "Explore roles\nthat fit you",
    cls: "left-[40%] top-[42%]",
    color: "#1d70ed",
  },
  {
    n: "02",
    title: "APPLY",
    text: "Submit strong\napplications",
    cls: "left-[53%] top-[32%]",
    color: "#1683f7",
  },
  {
    n: "03",
    title: "INTERVIEW",
    text: "Prepare and ace\nyour interviews",
    cls: "left-[65%] top-[25%]",
    color: "#5e4dec",
  },
  {
    n: "04",
    title: "OFFER",
    text: "Receive offers\nwith confidence",
    cls: "left-[76%] top-[19%]",
    color: "#873ce7",
  },
  {
    n: "05",
    title: "NEXT MOVE",
    text: "Grow your career\nand keep moving",
    cls: "right-3 top-[6%]",
    color: "#6938df",
  },
];

export const path: Array<{
  step: number;
  title: string;
  copy: string;
  Icon: LucideIcon;
  tone: string;
}> = [
  {
    step: 1,
    title: "Discover",
    copy: "Find relevant opportunities based on your skills, experience, and career goals.",
    Icon: Compass,
    tone: "bg-[#2563eb]",
  },
  {
    step: 2,
    title: "Prepare",
    copy: "Build and improve your resume with tools designed to present your experience clearly.",
    Icon: FileText,
    tone: "bg-[#6d45dd]",
  },
  {
    step: 3,
    title: "Apply",
    copy: "Understand your fit, tailor your application, and apply with greater confidence.",
    Icon: FileCheck2,
    tone: "bg-[#2563eb]",
  },
  {
    step: 4,
    title: "Grow",
    copy: "Track applications, learn from your progress, and keep moving your career forward.",
    Icon: TrendingUp,
    tone: "bg-[#6d45dd]",
  },
];

export const howItWorks = [
  "Create your profile and add your experience",
  "Discover opportunities relevant to your goals",
  "Build and improve your resume",
  "Track applications and monitor your progress",
];

export const highlights: Array<{
  title: string;
  copy: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Personalized discovery",
    copy: "Find opportunities around your skills, experience, and goals.",
    Icon: Target,
  },
  {
    title: "Resume tools",
    copy: "Create, improve, and prepare resumes for real opportunities.",
    Icon: FileText,
  },
  {
    title: "Smarter applications",
    copy: "Understand job fit and strengthen your application before applying.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Career insights",
    copy: "Keep track of applications and make informed career decisions.",
    Icon: TrendingUp,
  },
];

export const values: Array<{
  title: string;
  copy: string;
  Icon: LucideIcon;
}> = [
  {
    title: "People First",
    copy: "We build around real career challenges and aim to make the job search simpler and more useful.",
    Icon: UsersRound,
  },
  {
    title: "Intelligence with Purpose",
    copy: "We use data and AI to provide practical guidance without taking control away from the person making the decision.",
    Icon: Brain,
  },
  {
    title: "Always Improving",
    copy: "We continuously learn, iterate, and improve the experience as the world of work changes.",
    Icon: Settings2,
  },
  {
    title: "Progress Matters",
    copy: "Every application, improvement, and new opportunity is part of a bigger career journey.",
    Icon: TrendingUp,
  },
];
