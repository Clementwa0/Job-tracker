ALTER TABLE "candidate_profiles" ALTER COLUMN "salary_currency" SET DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "salary_currency" SET DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "salary_currency" SET DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "education" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "work_experience" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "company_name" text DEFAULT '' NOT NULL;