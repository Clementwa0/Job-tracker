import type { PublicJobDetail } from "@/types/jobPosting";

export function DescriptionBody({ job }: { job: PublicJobDetail }) {
  const sections = job.descriptionSections;

  if (!sections || sections.length === 0) {
    return job.description.trim()
      ? <p className="whitespace-pre-wrap">{job.description}</p>
      : <p>The employer has not provided a description.</p>;
  }

  return (
    <div className="space-y-5">
      {sections.map((section, index) => {
        const hasBody = section.paragraphs.length > 0 || section.lists.length > 0;
        return (
          <div key={`${section.heading ?? "intro"}-${index}`}>
            {section.heading && (
              <h3 className={hasBody ? "mb-2 text-sm font-semibold text-foreground" : "mt-2 text-base font-semibold text-foreground"}>
                {section.heading}
              </h3>
            )}
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-2 break-words">{paragraph}</p>
            ))}
            {section.lists.map((list, i) => (
              <ul key={i} className="mb-2 list-disc space-y-1.5 pl-5">
                {list.items.map((item, j) => <li key={j} className="break-words">{item}</li>)}
              </ul>
            ))}
          </div>
        );
      })}
    </div>
  );
}
