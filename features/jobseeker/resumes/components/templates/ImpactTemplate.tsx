import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function ImpactTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage>
    <header className="grid grid-cols-[1fr_230px] items-end gap-8 border-b-2 pb-5" style={{ borderColor: accent }}>
      <div><div className="mb-2 text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>CAREER PROFILE</div><h1 className="text-[30px] font-extrabold leading-none tracking-[-0.05em] text-gray-950">{contact.fullName || "Your Name"}</h1>{contact.title && <p className="mt-2 text-[10.5px] font-medium text-gray-600">{contact.title}</p>}</div>
      <div className="text-right"><ContactLine data={data} /></div>
    </header>
    {data.summary && <section className="mt-5 rounded-r-md border-l-4 bg-gray-50 px-4 py-3" style={{ borderColor: accent }}><p className="text-[9.5px] font-medium leading-[1.55] text-gray-700">{data.summary}</p></section>}
    {data.experience.length > 0 && <section className="mt-6"><SectionTitle accent={accent} mode="number">Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} numbered /></section>}
    {data.projects.length > 0 && <section className="mt-6"><SectionTitle accent={accent} mode="number">Projects</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}
    <div className="mt-6 grid grid-cols-2 gap-8"><div>{data.education.length > 0 && <section><SectionTitle accent={accent} mode="number">Education</SectionTitle><EducationList items={data.education} /></section>}{data.certifications.length > 0 && <section className="mt-6"><SectionTitle accent={accent} mode="number">Certifications</SectionTitle><CertificationsList data={data} /></section>}</div><div>{data.skills.length > 0 && <section><SectionTitle accent={accent} mode="number">Skills</SectionTitle><SkillsList data={data} accent={accent} pills /></section>}{data.languages.length > 0 && <section className="mt-6"><SectionTitle accent={accent} mode="number">Languages</SectionTitle><LanguagesList data={data} /></section>}</div></div>
  </BasePage>;
}
