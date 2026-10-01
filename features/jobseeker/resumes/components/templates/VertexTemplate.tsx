import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function VertexTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
    <header className="rounded-sm border p-5" style={{ borderColor: `${accent}55` }}>
      <div className="flex items-start justify-between gap-8"><div><div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>PROFILE // RESUME</div><h1 className="text-[25px] font-bold tracking-[-0.04em] text-gray-950">{contact.fullName || "Your Name"}</h1>{contact.title && <p className="mt-1 text-[10px] text-gray-600">{contact.title}</p>}</div><div className="max-w-[360px] text-right"><ContactLine data={data} /></div></div>
    </header>
    {data.summary && <section className="mt-5"><SectionTitle accent={accent} mode="bar">Summary</SectionTitle><p className="text-[9px] leading-[1.6] text-gray-700">{data.summary}</p></section>}
    {data.experience.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="bar">Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} /></section>}
    {data.projects.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="bar">Selected Projects</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}
    <div className="mt-5 grid grid-cols-2 gap-8 border-t pt-5" style={{ borderColor: `${accent}35` }}>
      <div>{data.skills.length > 0 && <section><SectionTitle accent={accent} mode="bar">Tech Stack</SectionTitle><SkillsList data={data} accent={accent} pills /></section>}{data.education.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="bar">Education</SectionTitle><EducationList items={data.education} /></section>}</div>
      <div>{data.certifications.length > 0 && <section><SectionTitle accent={accent} mode="bar">Certifications</SectionTitle><CertificationsList data={data} /></section>}{data.languages.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="bar">Languages</SectionTitle><LanguagesList data={data} /></section>}</div>
    </div>
  </BasePage>;
}
