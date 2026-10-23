/**
 * Shared (import-free) constants and types for the Career Resources CMS.
 * Safe to import from the DB schema, API routes and client components alike.
 */

export const RESOURCE_TYPES = ["article", "guide", "template", "checklist", "video"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_STATUSES = ["draft", "published"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  article: "Article",
  guide: "Guide",
  template: "Template",
  checklist: "Checklist",
  video: "Video",
};

/** Cloudinary folder every CMS asset lives in (see lib/storage/upload.server.ts). */
export const RESOURCE_UPLOAD_FOLDER = "jobtrail/resources";

export const COVER_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

/**
 * Metadata for a file stored in Cloudinary. Persisted as JSON on the
 * resource row (one cover image + one attachment per resource).
 */
export interface StoredFile {
  publicId: string;
  /** Cloudinary secure (https) delivery URL. */
  url: string;
  /** MIME type, e.g. "application/pdf" or "image/webp". */
  fileType: string;
  originalFilename: string;
  /** Size in bytes. */
  size: number;
  resourceType: "image" | "raw";
}

/** Slugs that would collide with fixed API/page routes. */
export const RESERVED_RESOURCE_SLUGS = ["recommended", "categories", "new", "bookmarks"] as const;
