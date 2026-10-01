import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function MonoTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage className="px-[60px] py-[52px]">
    <header className="border-b border-gray-900 pb-4"><h1 className="text-[27px] font-semibold tracking-[-0.045em] text-gray-950">{contact.fullName || "Your Name"}</h1>{contact.title && <p className="mt-1 text-[10px] text-gray-700">{contact.title}</p>}<div className="mt-2"><ContactLine data={data} /></div></header>
    {data.summary && <section className="mt-5"><SectionTitle accent={accent} mode="plain">Summary</SectionTitle><p className="text-[9.5px] leading-[1.55] text-gray-700">{data.summary}</p></section>}
    {data.experience.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="plain">Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} /></section>}
    {data.education.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="plain">Education</SectionTitle><EducationList items={data.education} /></section>}
    {data.projects.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="plain">Projects</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}
    {data.skills.length > 0 && <section className="mt-5"><SectionTitle accent={accent} mode="plain">Skills</SectionTitle><SkillsList data={data} accent={accent} /></section>}
    <div className="mt-5 grid grid-cols-2 gap-8">{data.certifications.length > 0 && <section><SectionTitle accent={accent} mode="plain">Certifications</SectionTitle><CertificationsList data={data} /></section>}{data.languages.length > 0 && <section><SectionTitle accent={accent} mode="plain">Languages</SectionTitle><LanguagesList data={data} /></section>}</div>
  </BasePage>;
}
