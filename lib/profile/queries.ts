import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { candidateProfiles, resumes, users, type CandidateProfile } from "@/lib/db/schema";
import type { JobseekerProfile, ProfileResponse } from "@/types/profile";
import { computeCompleteness } from "@/lib/profile/completeness";
import { pickBestResume, type JobseekerContext } from "@/lib/profile/context";
import type { ProfilePatch } from "@/lib/profile/sanitizeProfileInput";

/** Stored row (or nothing yet) → the plain shape the API/UI use. */
export function toProfile(row: CandidateProfile | undefined): JobseekerProfile {
  return {
    headline: row?.headline ?? "",
    location: row?.location ?? "",
    phone: row?.phone ?? "",
    bio: row?.bio ?? "",
    website: row?.website ?? "",
    linkedinUrl: row?.linkedinUrl ?? "",
    githubUrl: row?.githubUrl ?? "",
    yearsExperience: row?.yearsExperience ?? null,
    skills: row?.skills ?? [],
    education: (row?.education ?? []) as JobseekerProfile["education"],
    certifications: (row?.certifications ?? []) as JobseekerProfile["certifications"],
    workExperience: (row?.workExperience ?? []) as JobseekerProfile["workExperience"],
    targetRoles: row?.targetRoles ?? [],
    preferredLocations: row?.preferredLocations ?? [],
    preferredJobTypes: row?.preferredJobTypes ?? [],
    preferredWorkModes: row?.preferredWorkModes ?? [],
    expectedSalaryMin: row?.expectedSalaryMin ?? null,
    expectedSalaryMax: row?.expectedSalaryMax ?? null,
    salaryCurrency: row?.salaryCurrency ?? "KES",
  };
}

/** Loads the user, their profile row and the facts from their best resume. */
export async function loadJobseekerContext(userId: string): Promise<JobseekerContext | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [profileRow] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  const resumeRows = await db
    .select({
      contact: resumes.contact,
      summary: resumes.summary,
      experience: resumes.experience,
      education: resumes.education,
      skills: resumes.skills,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));

  return {
    user: {
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      picture: user.picture,
    },
    profile: toProfile(profileRow),
    resume: pickBestResume(resumeRows),
  };
}

export async function getProfileResponse(userId: string): Promise<ProfileResponse | null> {
  const ctx = await loadJobseekerContext(userId);
  if (!ctx) return null;

  return {
    name: ctx.user.name,
    email: ctx.user.email,
    picture: ctx.user.picture,
    profile: ctx.profile,
    completeness: computeCompleteness({
      user: ctx.user,
      profile: ctx.profile,
      resume: ctx.resume,
    }),
  };
}

/** Applies a validated patch (creating the profile row if this is the first write). */
export async function updateProfile(userId: string, patch: ProfilePatch): Promise<void> {
  await db.transaction(async (tx) => {
    if (patch.name !== undefined) {
      await tx.update(users).set({ name: patch.name }).where(eq(users.id, userId));
    }

    // `columns` was built by sanitizeProfileInput and only holds
    // candidate_profiles column keys, so it's safe to spread into the write.
    const columns = patch.columns as Partial<typeof candidateProfiles.$inferInsert>;

    await tx
      .insert(candidateProfiles)
      .values({ userId, ...columns })
      .onConflictDoUpdate({
        target: candidateProfiles.userId,
        set: { ...columns, updatedAt: new Date() },
      });
  });
}
