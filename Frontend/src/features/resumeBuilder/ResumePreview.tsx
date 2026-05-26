import { memo, useMemo, type CSSProperties } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";
import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";

interface Props {
  data: ResumeData;
}

/* ============================================================== *
 * Static template configuration — improved spacing & typography   *
 * ============================================================== */

interface TemplateConfig {
  compact: boolean;
  padding: string;
  fontFamily: string;
  fontSize: string;
  nameSize: string;
  headerCls: string;
  headingCls: string;
  contactJustify: string;
  sectionSpacing: string;
  entrySpacing: string;
}

const TEMPLATES: Record<ResumeTemplate, TemplateConfig> = {
  modern: {
    compact: false,
    padding: "0.7in 0.75in",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: "10.5px",
    nameSize: "28px",
    headerCls: "border-b-2 pb-4 mb-5",
    headingCls: "mb-3 text-[11px] font-bold uppercase tracking-[0.15em]",
    contactJustify: "",
    sectionSpacing: "mt-6 first:mt-0",
    entrySpacing: "space-y-4",
  },
  classic: {
    compact: false,
    padding: "0.7in 0.75in",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "11px",
    nameSize: "26px",
    headerCls: "text-center border-b-2 border-gray-800 pb-5 mb-5",
    headingCls: "mb-3 border-b border-gray-300 pb-2 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-gray-700",
    contactJustify: "justify-center",
    sectionSpacing: "mt-5 first:mt-0",
    entrySpacing: "space-y-4",
  },
  compact: {
    compact: true,
    padding: "0.5in 0.55in",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: "10px",
    nameSize: "20px",
    headerCls: "pb-3 mb-3",
    headingCls: "mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em]",
    contactJustify: "",
    sectionSpacing: "mt-4 first:mt-0",
    entrySpacing: "space-y-2.5",
  },
  executive: {
    compact: false,
    padding: "0.85in 0.9in",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "11px",
    nameSize: "32px",
    headerCls: "pb-6 mb-5",
    headingCls: "mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-gray-800",
    contactJustify: "justify-center",
    sectionSpacing: "mt-6 first:mt-0",
    entrySpacing: "space-y-5",
  },
  minimal: {
    compact: true,
    padding: "0.55in 0.6in",
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: "10px",
    nameSize: "20px",
    headerCls: "pb-3 mb-3",
    headingCls: "mb-2 text-[10.5px] font-bold uppercase tracking-[0.15em] text-gray-500",
    contactJustify: "",
    sectionSpacing: "mt-4 first:mt-0",
    entrySpacing: "space-y-2.5",
  },
};

/* Locale-stable formatter */
const MONTH_FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
});

function fmtMonth(value: string): string {
  if (!value) return "";
  const d = new Date(`${value}-01`);
  return Number.isNaN(d.getTime()) ? "" : MONTH_FMT.format(d);
}

function fmtRange(start: string, end: string, current?: boolean): string {
  const s = fmtMonth(start);
  const e = current ? "Present" : fmtMonth(end);
  return [s, e].filter(Boolean).join(" – ");
}

/* ============================================================== *
 *                        Component                               *
 * ============================================================== */

function ResumePreview({ data }: Props) {
  const {
    contact,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    languages,
    accent,
    template,
  } = data;

  const cfg = TEMPLATES[template] ?? TEMPLATES.modern;

  const articleStyle = useMemo<CSSProperties>(
    () => ({
      width: "8.5in",
      minHeight: "11in",
      padding: cfg.padding,
      fontFamily: cfg.fontFamily,
      fontSize: cfg.fontSize,
      lineHeight: 1.5,
      color: "#1f2937",
      ["--accent" as string]: accent,
    }),
    [cfg, accent],
  );

  const nameStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: cfg.nameSize,
      color: template === "modern" || template === "executive" ? accent : "#111827",
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    }),
    [cfg.nameSize, template, accent],
  );

  const titleStyle = {
    fontSize: cfg.compact ? "11px" : "13px",
    color: "#4b5563",
    marginTop: "4px",
    fontWeight: 400,
  };

  const contactStyle = {
    fontSize: "10px",
    color: "#6b7280",
  };

  return (
    <article
      id="resume-print-area"
      lang="en"
      className="resume-paper mx-auto bg-white shadow-xl ring-1 ring-gray-200 print:shadow-none print:ring-0"
      style={articleStyle}
    >
      {/* Header */}
      <header 
        className={cfg.headerCls}
        style={template === "modern" ? { borderColor: accent } : undefined}
      >
        <div className={template === "executive" || template === "classic" ? "text-center" : ""}>
          <h1 className="font-bold" style={nameStyle}>
            {contact.fullName || "Your Name"}
          </h1>
          {contact.title && (
            <p style={titleStyle}>{contact.title}</p>
          )}
        </div>
        
        <div
          className={`mt-3 flex flex-wrap gap-x-5 gap-y-1.5 ${cfg.contactJustify}`}
          style={contactStyle}
        >
          {contact.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.phone}
            </span>
          )}
          {contact.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.location}
            </span>
          )}
          {contact.website && (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.website}
            </span>
          )}
          {contact.linkedin && (
            <span className="inline-flex items-center gap-1.5">
              <Linkedin className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.linkedin}
            </span>
          )}
          {contact.github && (
            <span className="inline-flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5 opacity-70" aria-hidden /> {contact.github}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <Section title="Professional Summary" cfg={cfg} template={template} accent={accent}>
          <p className="leading-relaxed text-gray-700">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Professional Experience" cfg={cfg} template={template} accent={accent}>
          <ul className={cfg.entrySpacing}>
            {experience.map((x) => (
              <li key={x.id} className="resume-entry group">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 mb-1">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {x.role || "Role"}
                    </span>
                    {x.company && (
                      <span className="text-gray-600">
                        {" · "}{x.company}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {fmtRange(x.startDate, x.endDate, x.current)}
                  </span>
                </div>
                {x.location && (
                  <p className="text-[10px] text-gray-500 mb-1.5">{x.location}</p>
                )}
                {x.bullets.filter(Boolean).length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-gray-700">
                    {x.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects" cfg={cfg} template={template} accent={accent}>
          <ul className={cfg.entrySpacing}>
            {projects.map((p) => (
              <li key={p.id} className="resume-entry">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {p.name || "Project"}
                  </span>
                  {p.url && (
                    <span className="text-[10px] text-gray-500">
                      {p.url}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-gray-700 leading-relaxed">{p.description}</p>
                )}
                {p.tech.length > 0 && (
                  <p className="mt-1.5 text-[10px] text-gray-500 font-medium">
                    {p.tech.join(" • ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education" cfg={cfg} template={template} accent={accent}>
          <ul className={cfg.entrySpacing}>
            {education.map((ed) => (
              <li key={ed.id} className="resume-entry">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 mb-1">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {ed.school || "School"}
                    </span>
                    {(ed.degree || ed.field) && (
                      <span className="text-gray-600">
                        {" · "}{ed.degree}{ed.field ? `, ${ed.field}` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {fmtRange(ed.startDate, ed.endDate)}
                  </span>
                </div>
                {ed.notes && (
                  <p className="mt-1 text-gray-600 text-[10.5px]">{ed.notes}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills" cfg={cfg} template={template} accent={accent}>
          <div className="space-y-2">
            {skills.map((g) => (
              <div key={g.id} className="flex gap-x-3">
                <dt className="font-semibold text-gray-900 min-w-[100px] text-[10.5px]">
                  {g.category || "Skills"}
                </dt>
                <dd className="text-gray-700 text-[10.5px]">{g.items.join(" • ")}</dd>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications" cfg={cfg} template={template} accent={accent}>
          <ul className="space-y-2">
            {certifications.map((c) => (
              <li key={c.id} className="resume-entry flex flex-wrap items-baseline justify-between gap-x-2">
                <div>
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  {c.issuer && (
                    <span className="text-gray-600"> · {c.issuer}</span>
                  )}
                </div>
                {c.date && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    {fmtRange(c.date, "")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="Languages" cfg={cfg} template={template} accent={accent}>
          <p className="text-gray-700">
            {languages
              .map((l) => (
                <span key={l.name}>
                  <span className="font-medium">{l.name}</span>
                  {l.level && (
                    <span className="text-gray-500"> ({l.level})</span>
                  )}
                </span>
              ))
              .reduce((prev, curr, i) => (
                <>{prev}{i > 0 && " • "}{curr}</>
              ))}
          </p>
        </Section>
      )}
    </article>
  );
}

export default memo(ResumePreview);

/* ============================================================== *
 *                         Section Component                      *
 * ============================================================== */

interface SectionProps {
  title: string;
  children: React.ReactNode;
  cfg: TemplateConfig;
  template: ResumeTemplate;
  accent: string;
}

const Section = memo(function Section({
  title,
  children,
  cfg,
  template,
  accent,
}: SectionProps) {
  const headingStyle = useMemo(() => {
    const base: CSSProperties = {
      color: template === "modern" ? accent : undefined,
      borderBottom: template === "executive" ? `1.5px solid ${accent}` : undefined,
      paddingBottom: template === "executive" ? "4px" : undefined,
    };
    return Object.keys(base).length > 0 ? base : undefined;
  }, [template, accent]);

  return (
    <section className={cfg.sectionSpacing}>
      <h2 className={cfg.headingCls} style={headingStyle}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
});