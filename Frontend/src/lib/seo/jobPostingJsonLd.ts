import type { PublicJobDetail } from "@/types/jobPosting";
import { getSiteUrl } from "./siteUrl";

export function buildJobPostingJsonLd(job: PublicJobDetail) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/jobs/${job.slug}`;

  const salary =
    job.salaryMin != null || job.salaryMax != null
      ? {
          "@type": "MonetaryAmount",
          currency: job.salaryCurrency || "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax,
            unitText: "YEAR",
          },
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    url,
    identifier: {
      "@type": "PropertyValue",
      name: job.company?.name,
      value: job.id,
    },
    hiringOrganization: job.company
      ? {
          "@type": "Organization",
          name: job.company.name,
          sameAs: job.company.website,
          logo: job.company.logo,
        }
      : undefined,
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
          },
        }
      : undefined,
    employmentType: job.jobType?.toUpperCase().replace("-", "_"),
    jobLocationType: job.workMode === "remote" ? "TELECOMMUTE" : undefined,
    baseSalary: salary,
    skills: job.tags?.join(", "),
    directApply: false,
  };
}
