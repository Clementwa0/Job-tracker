import type { ResumeData } from "@/types/resume-builder";
import { BasePage, ContactLine, SectionTitle, ExperienceList, EducationList, ProjectsList, SkillsList, CertificationsList, LanguagesList } from "./shared";

export default function AuroraTemplate({ data }: { data: ResumeData }) {
  const { contact, accent } = data;
  return <BasePage>
    <header className="border-b pb-5" style={{ borderColor: `${accent}45` }}>
      <div className="flex items-end justify-between gap-8">
        <div><h1 className="text-[29px] font-bold tracking-[-0.04em] text-gray-950">{contact.fullName || "Your Name"}</h1>{contact.title && <p className="mt-1 text-[11px] font-medium" style={{ color: accent }}>{contact.title}</p>}</div>
        <div className="max-w-[370px] text-right"><ContactLine data={data} /></div>
      </div>
    </header>
    {data.summary && <section className="mt-5"><SectionTitle accent={accent}>Profile</SectionTitle><p className="text-[9.5px] leading-[1.55] text-gray-700">{data.summary}</p></section>}
    {data.experience.length > 0 && <section className="mt-5"><SectionTitle accent={accent}>Experience</SectionTitle><ExperienceList items={data.experience} accent={accent} /></section>}
    <div className="mt-5 grid grid-cols-[1.55fr_1fr] gap-8">
      <div className="min-w-0">{data.projects.length > 0 && <section><SectionTitle accent={accent}>Projects</SectionTitle><ProjectsList items={data.projects} accent={accent} /></section>}{data.education.length > 0 && <section className="mt-5"><SectionTitle accent={accent}>Education</SectionTitle><EducationList items={data.education} /></section>}</div>
      <aside className="min-w-0">{data.skills.length > 0 && <section><SectionTitle accent={accent}>Skills</SectionTitle><SkillsList data={data} accent={accent} pills /></section>}{data.certifications.length > 0 && <section className="mt-5"><SectionTitle accent={accent}>Certifications</SectionTitle><CertificationsList data={data} /></section>}{data.languages.length > 0 && <section className="mt-5"><SectionTitle accent={accent}>Languages</SectionTitle><LanguagesList data={data} /></section>}</aside>
    </div>
  </BasePage>;
}
