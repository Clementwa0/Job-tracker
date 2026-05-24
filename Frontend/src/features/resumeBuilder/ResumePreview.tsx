import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface Props {
  data: ResumeData;
}

function fmtRange(start: string, end: string, current?: boolean) {
  const s = start ? new Date(start + "-01").toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";
  const e = current ? "Present" : end ? new Date(end + "-01").toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";
  return [s, e].filter(Boolean).join(" — ");
}

export default function ResumePreview({ data }: Props) {
  const { contact, summary, experience, education, projects, skills, certifications, languages, accent, template } = data;
  const compact = template === "compact" || template === "minimal";

  const headerCls =
    template === "modern"
      ? "border-b-2 pb-3 mb-4"
      : template === "classic"
        ? "text-center border-b border-gray-300 pb-3 mb-4"
        : template === "executive"
          ? "pb-4 mb-4"
          : template === "minimal"
            ? "pb-2 mb-3"
            : "pb-2 mb-3";

  const nameStyle: React.CSSProperties = {
    fontSize: compact ? "20px" : template === "executive" ? "30px" : "26px",
    color: template === "modern" || template === "executive" ? accent : "#111827",
    letterSpacing: template === "executive" ? "0.02em" : undefined,
  };

  return (
    <article
      id="resume-print-area"
      className="resume-paper mx-auto bg-white text-gray-900 shadow-lg ring-1 ring-gray-200 print:shadow-none print:ring-0"
      style={
        {
          width: "8.5in",
          minHeight: "11in",
          padding: compact ? "0.55in 0.6in" : template === "executive" ? "0.8in 0.85in" : "0.7in 0.75in",
          fontFamily:
            template === "executive"
              ? "'Georgia', 'Times New Roman', serif"
              : "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: compact ? "10.5px" : "11.5px",
          lineHeight: 1.45,
          "--accent": accent,
        } as React.CSSProperties
      }
    >
      <header
        className={headerCls}
        style={template === "modern" ? { borderColor: accent } : template === "executive" ? { borderBottom: `3px double ${accent}` } : undefined}
      >
        <h1 className="font-bold tracking-tight" style={nameStyle}>
          {contact.fullName || "Your Name"}
        </h1>
        {contact.title && (
          <p className="mt-0.5 text-gray-700" style={{ fontSize: compact ? "11px" : "13px" }}>
            {contact.title}
          </p>
        )}
        <div
          className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-600 ${
            template === "classic" || template === "executive" ? "justify-center" : ""
          }`}
          style={{ fontSize: "10.5px" }}
        >
          {contact.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
          {contact.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
          {contact.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.location}</span>}
          {contact.website && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{contact.website}</span>}
          {contact.linkedin && <span className="inline-flex items-center gap-1"><Linkedin className="h-3 w-3" />{contact.linkedin}</span>}
          {contact.github && <span className="inline-flex items-center gap-1"><Github className="h-3 w-3" />{contact.github}</span>}
        </div>
      </header>

      {summary && (
        <Section title="Summary" accent={accent} template={template}>
          <p className="whitespace-pre-wrap text-gray-800">{summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience" accent={accent} template={template}>
          <ul className="space-y-3">
            {experience.map((x) => (
              <li key={x.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-semibold text-gray-900">
                    {x.role || "Role"}
                    {x.company && <span className="font-normal text-gray-700"> · {x.company}</span>}
                  </p>
                  <p className="text-[10.5px] text-gray-500">{fmtRange(x.startDate, x.endDate, x.current)}</p>
                </div>
                {x.location && <p className="text-[10.5px] text-gray-500">{x.location}</p>}
                {x.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-800">
                    {x.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects" accent={accent} template={template}>
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id}>
                <p className="font-semibold text-gray-900">
                  {p.name || "Project"}{" "}
                  {p.url && <span className="text-[10.5px] font-normal text-gray-500">· {p.url}</span>}
                </p>
                {p.description && <p className="text-gray-800">{p.description}</p>}
                {p.tech.length > 0 && <p className="mt-0.5 text-[10.5px] text-gray-600">{p.tech.join(" · ")}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education" accent={accent} template={template}>
          <ul className="space-y-2">
            {education.map((ed) => (
              <li key={ed.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-semibold text-gray-900">
                    {ed.school || "School"}
                    {(ed.degree || ed.field) && (
                      <span className="font-normal text-gray-700">
                        {" "}· {ed.degree}
                        {ed.field ? `, ${ed.field}` : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-[10.5px] text-gray-500">{fmtRange(ed.startDate, ed.endDate)}</p>
                </div>
                {ed.notes && <p className="mt-0.5 text-gray-700">{ed.notes}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills" accent={accent} template={template}>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
            {skills.map((g) => (
              <div key={g.id} className="contents">
                <dt className="font-semibold text-gray-900">{g.category || "Skills"}</dt>
                <dd className="text-gray-800">{g.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications" accent={accent} template={template}>
          <ul className="space-y-1">
            {certifications.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-2">
                <p className="text-gray-900">
                  <span className="font-semibold">{c.name}</span>
                  {c.issuer && <span className="text-gray-700"> · {c.issuer}</span>}
                </p>
                {c.date && <p className="text-[10.5px] text-gray-500">{fmtRange(c.date, "")}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Languages" accent={accent} template={template}>
          <p className="text-gray-800">
            {languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}
          </p>
        </Section>
      )}
    </article>
  );
}

function Section({
  title,
  children,
  accent,
  template,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
  template: ResumeTemplate;
}) {
  const headingCls =
    template === "classic"
      ? "mb-2 border-b border-gray-300 pb-1 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-700"
      : template === "executive"
        ? "mb-2 text-[12px] font-bold uppercase tracking-[0.18em] text-gray-800"
        : template === "minimal"
          ? "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
          : "mb-1.5 text-[11px] font-semibold uppercase tracking-wider";

  return (
    <section className="mt-4 first:mt-0">
      <h2
        className={headingCls}
        style={template === "modern" ? { color: accent } : template === "executive" ? { borderBottom: `1px solid ${accent}`, paddingBottom: 2 } : undefined}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
