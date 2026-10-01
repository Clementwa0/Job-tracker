import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function AtlasTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage className="p-0">
    <div className="grid min-h-[1123px] grid-cols-[225px_1fr]">
      <aside className="p-[34px] text-white" style={{ backgroundColor: "#111827" }}>
        <div className="h-1 w-12" style={{ backgroundColor: accent }} />
        <h1 className="mt-5 text-[24px] font-bold leading-[1.05] tracking-[-0.03em]">{contact.fullName || "Your Name"}</h1>
        {contact.title && <p className="mt-2 text-[9.5px] font-medium" style={{ color: accent }}>{contact.title}</p>}
        <div className="mt-7"><ContactLine data={data} dark /></div>
        {data.skills.length > 0 && <section className="mt-8"><SectionTitle accent={accent} mode="bar" dark>Skills</SectionTitle><SkillsList data={data} accent={accent} dark pills /></section>}
        {data.certifications.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="bar" dark>Certifications</SectionTitle><CertificationsList data={data} dark /></section>}
        {data.languages.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="bar" dark>Languages</SectionTitle><LanguagesList data={data} dark /></section>}
      </aside>
      <main className="p-[42px]">
        {data.summary && <section><SectionTitle accent={accent}>Profile</SectionTitle><p className="text-[9.5px] leading-[1.55] text-gray-700">{data.summary}</p></section>}
        {data.experience.length > 0 && <section className="mt-6"><SectionTitle accent={accent}>Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} /></section>}
        {data.projects.length > 0 && <section className="mt-6"><SectionTitle accent={accent}>Projects</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}
        {data.education.length > 0 && <section className="mt-6"><SectionTitle accent={accent}>Education</SectionTitle><EducationList items={data.education} /></section>}
      </main>
    </div>
  </BasePage>;
}
