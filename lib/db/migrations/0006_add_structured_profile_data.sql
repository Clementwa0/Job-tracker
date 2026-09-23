ALTER TABLE "candidate_profiles" ADD COLUMN "education" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "candidate_profiles" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "candidate_profiles" ADD COLUMN "work_experience" jsonb DEFAULT '[]'::jsonb NOT NULL;
