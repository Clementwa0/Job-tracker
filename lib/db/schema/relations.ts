import { relations } from "drizzle-orm";

import { adminUsers } from "./admin-users";
import { auditLogs } from "./audit-logs";
import { candidateProfiles } from "./candidate-profiles";
import { companies } from "./companies";
import { employerProfiles } from "./employer-profiles";
import { interviews } from "./interviews";
import { jobPostings } from "./job-postings";
import { jobActivity, jobAttachments, jobReminders, jobs } from "./jobs";
import { notifications } from "./notifications";
import { resumes } from "./resumes";
import { savedJobs } from "./saved-jobs";
import { sessions } from "./sessions";
import { userAccounts } from "./user-accounts";
import { users } from "./users";

/* ------------------------------ identity ------------------------------ */

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(userAccounts),
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
  employerProfile: one(employerProfiles, {
    fields: [users.id],
    references: [employerProfiles.userId],
  }),
  sessions: many(sessions),
  jobs: many(jobs),
  savedJobs: many(savedJobs),
  interviews: many(interviews),
  resumes: many(resumes),
  notifications: many(notifications),
  createdCompanies: many(companies),
  createdJobPostings: many(jobPostings),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
}));

export const candidateProfilesRelations = relations(
  candidateProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [candidateProfiles.userId],
      references: [users.id],
    }),
  }),
);

export const employerProfilesRelations = relations(
  employerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [employerProfiles.userId],
      references: [users.id],
    }),
    company: one(companies, {
      fields: [employerProfiles.companyId],
      references: [companies.id],
    }),
  }),
);

/* -------------------------------- admin -------------------------------- */

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  admin: one(adminUsers, {
    fields: [sessions.adminId],
    references: [adminUsers.id],
  }),
}));

/* ------------------------------ employers ------------------------------ */

export const companiesRelations = relations(companies, ({ one, many }) => ({
  creator: one(users, {
    fields: [companies.createdBy],
    references: [users.id],
  }),
  employerProfiles: many(employerProfiles),
  postings: many(jobPostings),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobPostings.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [jobPostings.createdBy],
    references: [users.id],
  }),
  trackedApplications: many(jobs),
}));

/* ------------------------------ jobseekers ----------------------------- */

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [jobs.jobPostingId],
    references: [jobPostings.id],
  }),
  attachments: many(jobAttachments),
  activity: many(jobActivity),
  reminders: many(jobReminders),
  interviews: many(interviews),
}));

export const jobAttachmentsRelations = relations(jobAttachments, ({ one }) => ({
  job: one(jobs, {
    fields: [jobAttachments.jobId],
    references: [jobs.id],
  }),
}));

export const jobActivityRelations = relations(jobActivity, ({ one }) => ({
  job: one(jobs, {
    fields: [jobActivity.jobId],
    references: [jobs.id],
  }),
}));

export const jobRemindersRelations = relations(jobReminders, ({ one }) => ({
  job: one(jobs, {
    fields: [jobReminders.jobId],
    references: [jobs.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [savedJobs.jobPostingId],
    references: [jobPostings.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

/* ------------------------------- platform ------------------------------ */

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actorUser: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
  actorAdmin: one(adminUsers, {
    fields: [auditLogs.actorAdminId],
    references: [adminUsers.id],
  }),
}));
