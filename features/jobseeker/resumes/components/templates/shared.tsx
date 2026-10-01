import type { CSSProperties, ReactNode } from "react";
import type { ResumeData, ResumeEducation, ResumeExperience, ResumeProject, ResumeTemplate } from "@/types/resume-builder";

export function fmtRange(start: string, end: string, current?: boolean) {
  const format = (value: string) => value ? new Date(`${value}-01`).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";
  return [format(start), current ? "Present" : format(end)].filter(Boolean).join(" – ");
}

export function ContactLine({ data, dark = false, centered = false, compact = false }: { data: ResumeData; dark?: boolean; centered?: boolean; compact?: boolean }) {
  const { contact } = data;
  const values = [contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github].filter(Boolean);
  return values.length ? (
    <div className={`flex flex-wrap gap-x-3 gap-y-1.5 text-[9.5px] leading-relaxed ${centered ? "justify-center" : ""} ${dark ? "text-white/75" : "text-gray-600"}`}>
      {values.map((value, i) => <span key={`${value}-${i}`}>{value}</span>)}
    </div>
  ) : null;
}

export function SectionTitle({ children, accent, mode = "line", dark = false }: { children: ReactNode; accent: string; mode?: "line" | "bar" | "plain" | "number"; dark?: boolean }) {
  if (mode === "bar") return <h2 className={`mb-3 border-l-[3px] pl-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ${dark ? "text-white" : "text-gray-900"}`} style={{ borderColor: accent }}>{children}</h2>;
  if (mode === "number") return <h2 className={`mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] ${dark ? "text-white" : "text-gray-900"}`}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />{children}</h2>;
  if (mode === "plain") return <h2 className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${dark ? "text-white" : "text-gray-900"}`}>{children}</h2>;
  return <h2 className={`mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-white" : "text-gray-900"}`}><span className="h-px flex-1" style={{ backgroundColor: accent }} /><span>{children}</span></h2>;
}

export function ExperienceList({ items, accent, compact = false, dark = false, numbered = false }: { items: ResumeExperience[]; accent: string; compact?: boolean; dark?: boolean; numbered?: boolean }) {
  return <div className="space-y-3.5">{items.map((x, index) => (
    <article key={x.id} className={numbered ? "grid grid-cols-[22px_1fr] gap-2" : ""}>
      {numbered && <div className="pt-0.5 text-[10px] font-bold" style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</div>}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className={`min-w-0 text-[10.5px] font-bold ${dark ? "text-white" : "text-gray-900"}`}>{x.role || "Role"}{x.company && <span className={`font-normal ${dark ? "text-white/70" : "text-gray-600"}`}> · {x.company}</span>}</div>
          <div className={`shrink-0 text-[8.5px] ${dark ? "text-white/60" : "text-gray-500"}`}>{fmtRange(x.startDate, x.endDate, x.current)}</div>
        </div>
        {x.location && <div className={`mt-0.5 text-[8.5px] ${dark ? "text-white/55" : "text-gray-500"}`}>{x.location}</div>}
        {x.bullets.filter(Boolean).length > 0 && <ul className={`mt-1.5 space-y-0.5 pl-4 text-[9.5px] leading-[1.45] ${dark ? "text-white/80" : "text-gray-700"}`}>
          {x.bullets.filter(Boolean).map((b, i) => <li key={i} className="list-disc">{b}</li>)}
        </ul>}
      </div>
    </article>
  ))}</div>;
}

export function EducationList({ items, dark = false }: { items: ResumeEducation[]; dark?: boolean }) {
  return <div className="space-y-2.5">{items.map((x) => <article key={x.id}>
    <div className="flex items-baseline justify-between gap-3"><div className={`text-[10px] font-bold ${dark ? "text-white" : "text-gray-900"}`}>{x.school || "School"}</div><div className={`shrink-0 text-[8.5px] ${dark ? "text-white/60" : "text-gray-500"}`}>{fmtRange(x.startDate, x.endDate)}</div></div>
    {(x.degree || x.field) && <div className={`text-[9.5px] ${dark ? "text-white/70" : "text-gray-700"}`}>{[x.degree, x.field].filter(Boolean).join(", ")}</div>}
    {x.notes && <div className={`mt-0.5 text-[9px] ${dark ? "text-white/60" : "text-gray-600"}`}>{x.notes}</div>}
  </article>)}</div>;
}

export function ProjectsList({ items, accent, dark = false }: { items: ResumeProject[]; accent: string; dark?: boolean }) {
  return <div className="space-y-3">{items.map((x) => <article key={x.id}>
    <div className={`text-[10px] font-bold ${dark ? "text-white" : "text-gray-900"}`}>{x.name || "Project"}{x.url && <span className="ml-2 text-[8px] font-normal" style={{ color: accent }}>{x.url}</span>}</div>
    {x.description && <div className={`mt-1 text-[9.5px] leading-[1.45] ${dark ? "text-white/75" : "text-gray-700"}`}>{x.description}</div>}
    {x.tech.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{x.tech.map((tech) => <span key={tech} className={`rounded px-1.5 py-0.5 text-[7.5px] font-medium ${dark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"}`}>{tech}</span>)}</div>}
  </article>)}</div>;
}

export function SkillsList({ data, accent, dark = false, pills = false }: { data: ResumeData; accent: string; dark?: boolean; pills?: boolean }) {
  return <div className="space-y-2">{data.skills.map((group) => <div key={group.id} className={pills ? "" : "flex gap-2"}>
    <div className={`min-w-[76px] text-[8.5px] font-bold uppercase tracking-wide ${dark ? "text-white/70" : "text-gray-600"}`}>{group.category}</div>
    <div className="flex flex-wrap gap-1">
      {group.items.map((item) => pills ? <span key={item} className={`rounded border px-1.5 py-0.5 text-[7.5px] ${dark ? "border-white/15 text-white/75" : "border-gray-200 text-gray-700"}`} style={{ borderColor: dark ? undefined : `${accent}35` }}>{item}</span> : <span key={item} className={`text-[9px] ${dark ? "text-white/80" : "text-gray-700"}`}>{item}{group.items.indexOf(item) < group.items.length - 1 ? " · " : ""}</span>)}
    </div>
  </div>)}</div>;
}

export function CertificationsList({ data, dark = false }: { data: ResumeData; dark?: boolean }) {
  return <div className="space-y-2">{data.certifications.map((x) => <div key={x.id} className="flex items-baseline justify-between gap-2"><div className={`text-[9px] ${dark ? "text-white/80" : "text-gray-700"}`}><strong className={dark ? "text-white" : "text-gray-900"}>{x.name}</strong>{x.issuer && ` · ${x.issuer}`}</div>{x.date && <span className={`shrink-0 text-[8px] ${dark ? "text-white/50" : "text-gray-500"}`}>{x.date}</span>}</div>)}</div>;
}

export function LanguagesList({ data, dark = false }: { data: ResumeData; dark?: boolean }) {
  return <div className={`text-[9px] ${dark ? "text-white/75" : "text-gray-700"}`}>{data.languages.map((x) => `${x.name}${x.level ? ` (${x.level})` : ""}`).join(" · ")}</div>;
}

export function BasePage({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div id="resume-print"><article className={`resume-page mx-auto min-h-[1123px] w-[794px] bg-white px-[54px] py-[48px] text-gray-800 ${className}`} style={style}>{children}</article></div>;
}
