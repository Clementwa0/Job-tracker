ALTER TABLE "job_postings" ADD COLUMN "category" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "responsibilities" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "experience_level" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "education_level" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "certifications" text DEFAULT '' NOT NULL;