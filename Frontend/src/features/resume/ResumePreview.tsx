import { memo } from "react";
import type { ResumeData, ResumeTemplate } from "@/types/resume-builder";

import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

import { TEMPLATE_STYLES } from "@/constants/index";

interface Props {
  data: ResumeData;
}

function fmtRange(start: string, end: string, current?: boolean) {
  const s = start
    ? new Date(start + "-01").toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "";

  const e = current
    ? "Present"
    : end
      ? new Date(end + "-01").toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })
      : "";

  return [s, e].filter(Boolean).join(" — ");
}

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

  const style = TEMPLATE_STYLES[template];

  const headerAlign =
    style.headerAlign === "center" ? "text-center" : "text-left";

  const headerBorderStyle: React.CSSProperties =
    style.headerBorder === "accent"
      ? {
          borderBottom: `3px solid ${accent}`,
        }
      : style.headerBorder === "double"
        ? {
            borderBottom: `4px double ${accent}`,
          }
        : style.headerBorder === "thin"
          ? {
              borderBottom: "1px solid rgba(0,0,0,0.14)",
            }
          : {};

  return (
    <div id="resume-print">
      <article className="resume-page">
        {/* HEADER */}

        <header className={`pb-5 ${headerAlign}`} style={headerBorderStyle}>
          <h1
            className="leading-none"
            style={
              {
                fontSize: style.nameSize,
                fontWeight: style.nameWeight,
                letterSpacing: style.nameSpacing,

                textTransform: style.nameTransform,

                color:
                  template === "modern" || template === "executive"
                    ? accent
                    : "#111827",
              } as React.CSSProperties
            }
          >
            {contact.fullName || "Your Name"}
          </h1>

          {contact.title && (
            <p
              className="mt-2 text-gray-700"
              style={{
                fontSize: style.roleSize,
                fontWeight: style.roleWeight,
              }}
            >
              {contact.title}
            </p>
          )}

          <div
            className={`mt-4 flex flex-wrap gap-y-2 text-gray-600 ${
              style.headerAlign === "center" ? "justify-center" : ""
            }`}
            style={{
              gap: style.contactGap,
              fontSize: "10.5px",
            }}
          >
            {contact.email && (
              <InfoItem
                icon={<Mail className="h-3 w-3" />}
                text={contact.email}
              />
            )}

            {contact.phone && (
              <InfoItem
                icon={<Phone className="h-3 w-3" />}
                text={contact.phone}
              />
            )}

            {contact.location && (
              <InfoItem
                icon={<MapPin className="h-3 w-3" />}
                text={contact.location}
              />
            )}

            {contact.website && (
              <InfoItem
                icon={<Globe className="h-3 w-3" />}
                text={contact.website}
              />
            )}

            {contact.linkedin && (
              <InfoItem
                icon={<Linkedin className="h-3 w-3" />}
                text={contact.linkedin}
              />
            )}

            {contact.github && (
              <InfoItem
                icon={<Github className="h-3 w-3" />}
                text={contact.github}
              />
            )}
          </div>
        </header>

        {/* SUMMARY */}

        {summary && (
          <Section title="Summary" accent={accent} template={template}>
            <p className="whitespace-pre-wrap text-gray-800">{summary}</p>
          </Section>
        )}

        {/* EXPERIENCE */}

        {experience.length > 0 && (
          <Section title="Experience" accent={accent} template={template}>
            <ul
              style={{
                display: "grid",
                gap: style.itemGap,
              }}
            >
              {experience.map((x) => (
                <li key={x.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold text-gray-900">
                      {x.role || "Role"}

                      {x.company && (
                        <span className="font-normal text-gray-700">
                          {" "}
                          · {x.company}
                        </span>
                      )}
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {fmtRange(x.startDate, x.endDate, x.current)}
                    </p>
                  </div>

                  {x.location && (
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {x.location}
                    </p>
                  )}

                  {x.bullets.filter(Boolean).length > 0 && (
                    <ul
                      className="mt-2 space-y-1 text-gray-800"
                      style={{
                        paddingLeft: style.bulletIndent,

                        listStyleType:
                          style.bulletStyle === "dash"
                            ? "none"
                            : style.bulletStyle,
                      }}
                    >
                      {x.bullets.filter(Boolean).map((b, i) => (
                        <li
                          key={i}
                          className={
                            style.bulletStyle === "dash"
                              ? "relative pl-3 before:absolute before:left-0 before:top-[0.52rem] before:h-px before:w-1.5 before:bg-gray-500"
                              : ""
                          }
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* PROJECTS */}

        {projects.length > 0 && (
          <Section title="Projects" accent={accent} template={template}>
            <ul
              style={{
                display: "grid",
                gap: style.itemGap,
              }}
            >
              {projects.map((p) => (
                <li key={p.id}>
                  <p className="font-semibold text-gray-900">
                    {p.name || "Project"}

                    {p.url && (
                      <span className="ml-1 text-[10px] font-normal text-gray-500">
                        · {p.url}
                      </span>
                    )}
                  </p>

                  {p.description && (
                    <p className="mt-1 text-gray-800">{p.description}</p>
                  )}

                  {p.tech.length > 0 && (
                    <p className="mt-1 text-[10px] text-gray-600">
                      {p.tech.join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* EDUCATION */}

        {education.length > 0 && (
          <Section title="Education" accent={accent} template={template}>
            <ul
              style={{
                display: "grid",
                gap: style.itemGap,
              }}
            >
              {education.map((ed) => (
                <li key={ed.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold text-gray-900">
                      {ed.school || "School"}

                      {(ed.degree || ed.field) && (
                        <span className="font-normal text-gray-700">
                          {" "}
                          · {ed.degree}
                          {ed.field ? `, ${ed.field}` : ""}
                        </span>
                      )}
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {fmtRange(ed.startDate, ed.endDate)}
                    </p>
                  </div>

                  {ed.notes && <p className="mt-1 text-gray-700">{ed.notes}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* SKILLS */}

        {skills.length > 0 && (
          <Section title="Skills" accent={accent} template={template}>
            <div className="grid gap-2">
              {skills.map((g) => (
                <div key={g.id} className="flex gap-2">
                  <span className="min-w-[110px] font-semibold text-gray-900">
                    {g.category}
                  </span>

                  <span className="text-gray-800">{g.items.join(" · ")}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* CERTIFICATIONS */}

        {certifications.length > 0 && (
          <Section title="Certifications" accent={accent} template={template}>
            <ul className="space-y-2">
              {certifications.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-2"
                >
                  <p className="text-gray-900">
                    <span className="font-semibold">{c.name}</span>

                    {c.issuer && (
                      <span className="text-gray-700"> · {c.issuer}</span>
                    )}
                  </p>

                  {c.date && (
                    <p className="text-[10px] text-gray-500">{c.date}</p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* LANGUAGES */}

        {languages.length > 0 && (
          <Section title="Languages" accent={accent} template={template}>
            <p className="text-gray-800">
              {languages
                .map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`)
                .join(" · ")}
            </p>
          </Section>
        )}
      </article>
    </div>
  );
}

/* ---------------------------------------- */

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {text}
    </span>
  );
}

/* ---------------------------------------- */

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
  const style = TEMPLATE_STYLES[template];

  const headingStyle =
    style.headingStyle === "rule" ? "border-b border-gray-300 pb-1" : "";

  return (
    <section
      style={{
        marginTop: style.sectionGap,
      }}
    >
      <h2
        className={`mb-3 uppercase ${headingStyle}`}
        style={
          {
            fontSize: style.headingSize,
            fontWeight: style.headingWeight,

            letterSpacing: style.headingTracking,

            color:
              template === "modern" || template === "executive"
                ? accent
                : "#374151",
          } as React.CSSProperties
        }
      >
        {title}
      </h2>

      <div>{children}</div>
    </section>
  );
}

export default memo(ResumePreview);
