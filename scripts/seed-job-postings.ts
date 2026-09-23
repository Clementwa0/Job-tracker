/**
 * Inserts sample published job postings so the dashboard's personalised
 * recommendations (and anything else reading `job_postings`) have data to
 * work with in development.
 *
 *   pnpm db:seed-jobs
 *
 * Idempotent: rows are keyed by slug and left alone if they already exist.
 * Creates a placeholder employer user + company to own the postings.
 * Do not run against production.
 */
export {};

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    /* file not present */
  }
}

const DAY = 24 * 60 * 60 * 1000;

interface Sample {
  slug: string;
  title: string;
  location: string;
  workMode: "remote" | "hybrid" | "onsite";
  jobType: "full-time" | "part-time" | "contract" | "internship";
  tags: string[];
  requirements: string;
  description: string;
  salary?: [number, number];
  deadlineInDays?: number;
}

const SAMPLES: Sample[] = [
  {
    slug: "software-engineer-intern-pezesha",
    title: "Software Engineer Intern",
    location: "Nairobi, Kenya",
    workMode: "hybrid",
    jobType: "internship",
    tags: ["javascript", "react", "git"],
    requirements: "Currently studying computer science or a related field.",
    description: "Work alongside engineers building fintech products with JavaScript and React.",
    salary: [400, 600],
    deadlineInDays: 5,
  },
  {
    slug: "ict-trainee-career-directions",
    title: "ICT Trainee",
    location: "Nairobi, Kenya",
    workMode: "onsite",
    jobType: "internship",
    tags: ["networking", "helpdesk", "windows"],
    requirements: "Diploma or degree in IT. Strong troubleshooting skills.",
    description: "Support end users, maintain workstations and assist the network team.",
    deadlineInDays: 8,
  },
  {
    slug: "web-developer-savannah-informatics",
    title: "Web Developer",
    location: "Nairobi, Kenya",
    workMode: "hybrid",
    jobType: "full-time",
    tags: ["javascript", "typescript", "react", "node", "postgresql"],
    requirements: "2+ years building web applications with React and Node.js.",
    description: "Build and maintain health-tech web apps used across East Africa.",
    salary: [2500, 4000],
    deadlineInDays: 14,
  },
  {
    slug: "frontend-engineer-kiteworks",
    title: "Frontend Engineer",
    location: "Remote – EMEA",
    workMode: "remote",
    jobType: "full-time",
    tags: ["react", "typescript", "css", "testing"],
    requirements: "3+ years of frontend experience with React and TypeScript.",
    description: "Own the customer-facing web app: performance, accessibility and design-system work.",
    salary: [85000, 115000],
    deadlineInDays: 21,
  },
  {
    slug: "backend-engineer-meridian-cloud",
    title: "Backend Engineer",
    location: "Lagos, Nigeria",
    workMode: "hybrid",
    jobType: "full-time",
    tags: ["node", "postgresql", "docker", "aws"],
    requirements: "3+ years building APIs with Node.js and PostgreSQL.",
    description: "Design services and data models that power a cloud platform for African SMEs.",
    salary: [65000, 90000],
    deadlineInDays: 18,
  },
  {
    slug: "senior-product-designer-northstar-labs",
    title: "Senior Product Designer",
    location: "Nairobi, Kenya",
    workMode: "hybrid",
    jobType: "full-time",
    tags: ["figma", "user research", "design systems"],
    requirements: "5+ years designing B2B or fintech products.",
    description: "Lead design across discovery, prototyping and shipping.",
    salary: [70000, 95000],
    deadlineInDays: 25,
  },
  {
    slug: "growth-marketing-lead-fieldnote",
    title: "Growth Marketing Lead",
    location: "Cape Town, South Africa",
    workMode: "hybrid",
    jobType: "full-time",
    tags: ["seo", "analytics", "paid acquisition"],
    requirements: "5+ years in growth or performance marketing.",
    description: "Own acquisition and lifecycle marketing for a fast-growing SaaS.",
    salary: [60000, 80000],
    deadlineInDays: 30,
  },
  {
    slug: "people-operations-manager-loom-co",
    title: "People Operations Manager",
    location: "Remote – Africa",
    workMode: "remote",
    jobType: "contract",
    tags: ["hr", "recruiting", "onboarding"],
    requirements: "4+ years in people operations.",
    description: "Run hiring, onboarding and people programmes for a distributed team.",
    salary: [45000, 60000],
  },
  {
    slug: "data-analyst-mara-analytics",
    title: "Data Analyst",
    location: "Nairobi, Kenya",
    workMode: "remote",
    jobType: "full-time",
    tags: ["sql", "python", "tableau", "excel"],
    requirements: "2+ years of experience analysing data with SQL and Python.",
    description: "Turn product and finance data into decisions with dashboards and analysis.",
    salary: [1800, 3000],
    deadlineInDays: 12,
  },
  {
    slug: "it-support-intern-bimas",
    title: "IT Support Intern",
    location: "Nairobi, Kenya",
    workMode: "onsite",
    jobType: "internship",
    tags: ["helpdesk", "windows", "hardware"],
    requirements: "Basic knowledge of computer hardware and networking.",
    description: "Provide first-line support and help maintain company equipment.",
    deadlineInDays: 7,
  },
];

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { companies, jobPostings, users } = await import("../lib/db/schema");

  const email = "seed-employer@jobtrail.local";

  await db
    .insert(users)
    .values({ name: "Sample Employer", email, role: "employer", emailVerified: true })
    .onConflictDoNothing({ target: users.email });
  const [employer] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  await db
    .insert(companies)
    .values({
      name: "Sample Employers Ltd",
      slug: "sample-employers-ltd",
      status: "approved",
      createdBy: employer.id,
    })
    .onConflictDoNothing({ target: companies.slug });
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.slug, "sample-employers-ltd"))
    .limit(1);

  const now = Date.now();
  let inserted = 0;

  for (const [i, s] of SAMPLES.entries()) {
    const rows = await db
      .insert(jobPostings)
      .values({
        title: s.title,
        slug: s.slug,
        companyId: company.id,
        createdBy: employer.id,
        description: s.description,
        requirements: s.requirements,
        location: s.location,
        salaryMin: s.salary?.[0] ?? null,
        salaryMax: s.salary?.[1] ?? null,
        jobType: s.jobType,
        workMode: s.workMode,
        tags: s.tags,
        applyMethodType: "external_link",
        applyMethodValue: "https://example.com/apply",
        status: "published",
        publishedAt: new Date(now - i * DAY),
        applicationDeadline: s.deadlineInDays ? new Date(now + s.deadlineInDays * DAY) : null,
      })
      .onConflictDoNothing({ target: jobPostings.slug })
      .returning({ id: jobPostings.id });
    inserted += rows.length;
  }

  console.log(`Seeded ${inserted} new job posting(s) (${SAMPLES.length - inserted} already existed).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
