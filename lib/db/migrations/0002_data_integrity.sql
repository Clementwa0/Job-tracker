-- Adds integrity rules to existing tables. These fail (and change nothing) if current
-- rows already break them. Preflight - each of these should return zero rows:
--   SELECT id, application_status FROM jobs WHERE application_status NOT IN
--     ('applied','waiting_response','interviewing','offer','rejected','ghosted','completed');
--   SELECT user_id, job_posting_id, count(*) FROM jobs WHERE job_posting_id IS NOT NULL
--     GROUP BY 1, 2 HAVING count(*) > 1;
--   SELECT user_id, job_id, interview_date, stage, count(*) FROM interviews
--     GROUP BY 1, 2, 3, 4 HAVING count(*) > 1;
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_job_date_stage_unique" UNIQUE("user_id","job_id","interview_date","stage");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_posting_unique" UNIQUE("user_id","job_posting_id");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_application_status_check" CHECK ("jobs"."application_status" in ('applied', 'waiting_response', 'interviewing', 'offer', 'rejected', 'ghosted', 'completed'));--> statement-breakpoint
CREATE INDEX "interviews_user_date_idx" ON "interviews" USING btree ("user_id","interview_date");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");