"use client";

import { useState } from "react";
import { ResumePreview } from "@/features/jobseeker/resumes/ResumeBuilderPage";
import { EMPTY_RESUME, type ResumeData } from "@/lib/resume/types";

export default function ResumePaginationTest() {
  const [pages, setPages] = useState(1);
  const data: ResumeData = {
    ...EMPTY_RESUME,
    template: "atlas",
    contact: { ...EMPTY_RESUME.contact, fullName: "Sample Candidate", title: "Senior Product Engineer", email: "candidate@example.com", phone: "+254 700 000 000", location: "Nairobi, Kenya" },
    summary: Array(12).fill("Experienced professional who builds teams and delivers measurable results across complex environments.").join(" "),
    experience: Array.from({ length: 4 }, (_, index) => ({
      id: `experience-${index}`, role: `Role ${index + 1}`, company: `Company ${index + 1}`, location: "Nairobi", startDate: "2021-01", endDate: "2024-01", current: false,
      bullets: Array.from({ length: 5 }, (_unused, item) => `Delivered initiative ${item + 1}, improving service outcomes by ${18 + item}% while coordinating teams across several regions and customer groups.`),
    })),
    education: Array.from({ length: 2 }, (_, index) => ({ id: `education-${index}`, school: `University ${index + 1}`, degree: "Bachelor of Science", field: "Computer Science", startDate: "2015-01", endDate: "2019-01", notes: "Honours" })),
    projects: Array.from({ length: 4 }, (_, index) => ({ id: `project-${index}`, name: `Project ${index + 1}`, url: "example.com", description: "Designed and launched an initiative used by thousands of customers, with reliable measurable results and clear documentation.", tech: ["TypeScript", "React", "PostgreSQL"] })),
    skills: Array.from({ length: 6 }, (_, index) => ({ id: `skill-${index}`, category: `Category ${index + 1}`, items: Array.from({ length: 5 }, (_unused, item) => `Skill ${index + 1}.${item + 1}`) })),
    certifications: Array.from({ length: 4 }, (_, index) => ({ id: `cert-${index}`, name: `Certification ${index + 1}`, issuer: "Professional Institute", date: "2024", url: "" })),
    languages: Array.from({ length: 2 }, (_, index) => ({ id: `language-${index}`, name: `Language ${index + 1}`, level: "Fluent" })),
  };
  return <main className="h-screen bg-background"><span data-testid="page-count">Detected pages: {pages}</span><ResumePreview data={data} exportRef={{ current: null }} onPageCount={setPages} /></main>;
}
