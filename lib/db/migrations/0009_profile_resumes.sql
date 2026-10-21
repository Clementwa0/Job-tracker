CREATE TABLE IF NOT EXISTS "profile_resumes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "public_id" text NOT NULL,
  "secure_url" text NOT NULL,
  "resource_type" text NOT NULL,
  "format" text,
  "original_filename" text NOT NULL,
  "size" integer NOT NULL,
  "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "profile_resumes_user_id_idx" ON "profile_resumes" ("user_id");
