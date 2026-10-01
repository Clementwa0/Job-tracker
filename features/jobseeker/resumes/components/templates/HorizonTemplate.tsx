import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function HorizonTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage>
    <header className="text-center">
      <div className="mx-auto mb-4 h-px w-20" style={{ backgroundColor: accent }} />
      <h1 className="font-serif text-[31px] font-semibold tracking-[-0.03em] text-gray-900">{contact.fullName || "Your Name"}</h1>
      {contact.title && <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-gray-600">{contact.title}</p>}
      <div className="mt-4"><ContactLine data={data} centered /></div>
    </header>
    {data.summary && <section className="mx-auto mt-7 max-w-[650px] text-center"><p className="text-[9.5px] italic leading-[1.6] text-gray-600">{data.summary}</p></section>}
    {data.experience.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="plain">Professional Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} /></section>}
    <div className="mt-7 grid grid-cols-[1.45fr_1fr] gap-10">
      <div>{data.projects.length > 0 && <section><SectionTitle accent={accent} mode="plain">Selected Work</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}{data.education.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="plain">Education</SectionTitle><EducationList items={data.education} /></section>}</div>
      <aside>{data.skills.length > 0 && <section><SectionTitle accent={accent} mode="plain">Core Competencies</SectionTitle><SkillsList data={data} accent={accent} /></section>}{data.certifications.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="plain">Credentials</SectionTitle><CertificationsList data={data} /></section>}{data.languages.length > 0 && <section className="mt-7"><SectionTitle accent={accent} mode="plain">Languages</SectionTitle><LanguagesList data={data} /></section>}</aside>
    </div>
    <div className="mt-8 h-px" style={{ backgroundColor: `${accent}45` }} />
  </BasePage>;
}
