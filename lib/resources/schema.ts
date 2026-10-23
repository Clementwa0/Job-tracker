import { z } from "zod";

import {
  ATTACHMENT_MIME_TYPES,
  COVER_IMAGE_MIME_TYPES,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
} from "./constants";

/**
 * Validation shared by the browser (inline form errors) and the API routes
 * (the authoritative check). Keep it free of server-only imports.
 */

export const storedFileSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
  url: z.string().trim().url().max(2000),
  fileType: z.string().trim().min(1).max(120),
  originalFilename: z.string().trim().min(1).max(255),
  size: z.number().int().positive().max(25 * 1024 * 1024),
  resourceType: z.enum(["image", "raw"]),
});

const coverImageSchema = storedFileSchema.refine(
  (f) => f.resourceType === "image" && (COVER_IMAGE_MIME_TYPES as readonly string[]).includes(f.fileType),
  "Cover image must be a PNG, JPG or WebP image.",
);

const attachmentSchema = storedFileSchema.refine(
  (f) => f.resourceType === "raw" && (ATTACHMENT_MIME_TYPES as readonly string[]).includes(f.fileType),
  "Attachment must be a PDF, DOC or DOCX file.",
);

const optionalUrl = z
  .string()
  .trim()
  .max(2000, "URL is too long.")
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => {
    if (v === null) return true;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http(s) URL.");

const tagsSchema = z
  .array(z.string().trim().min(1).max(30, "Tags can be at most 30 characters."))
  .max(10, "Use at most 10 tags.")
  .transform((tags) => {
    const seen = new Set<string>();
    return tags.filter((t) => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

export const resourceInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(150, "Title is too long (150 max)."),
  description: z.string().trim().max(300, "Short description is too long (300 max).").default(""),
  categoryId: z.string().uuid("Select a category."),
  type: z.enum(RESOURCE_TYPES, { message: "Select a resource type." }),
  content: z.string().max(200_000, "Content is too long.").default(""),
  coverImage: coverImageSchema.nullish().transform((v) => v ?? null),
  attachment: attachmentSchema.nullish().transform((v) => v ?? null),
  externalUrl: optionalUrl,
  tags: tagsSchema.default([]),
  featured: z.boolean().default(false),
  status: z.enum(RESOURCE_STATUSES).default("draft"),
  seoTitle: z.string().trim().max(70, "SEO title should be 70 characters or fewer.").default(""),
  seoDescription: z.string().trim().max(160, "SEO description should be 160 characters or fewer.").default(""),
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;

/** Extra requirements that only apply when a resource is going live. */
export function publishIssues(input: {
  description: string;
  content: string;
  attachment: unknown;
  externalUrl: string | null;
  /** True when `content` has visible text (see isRichTextEmpty). */
  hasContent: boolean;
}): Partial<Record<"description" | "content", string>> {
  const issues: Partial<Record<"description" | "content", string>> = {};
  if (!input.description.trim()) issues.description = "Add a short description before publishing.";
  if (!input.hasContent && !input.attachment && !input.externalUrl) {
    issues.content = "Add content, a downloadable attachment or an external link before publishing.";
  }
  return issues;
}

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long (60 max)."),
  description: z.string().trim().max(200, "Description is too long (200 max).").default(""),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

/** Flattens a ZodError into `{ field: firstMessage }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
