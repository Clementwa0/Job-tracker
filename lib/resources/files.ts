import { or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { parseCloudinaryUrl } from "@/lib/storage/cloudinary.server";
import { deleteUploadedFile } from "@/lib/storage/upload.server";
import { RESOURCE_UPLOAD_FOLDER, type StoredFile } from "./constants";

/**
 * A file reference sent by the client must point at an asset we uploaded into
 * the resources folder - never an arbitrary URL or someone else's file.
 * Returns an error message, or null when the reference is acceptable.
 */
export function validateResourceFileRef(file: StoredFile, label: string): string | null {
  const parsed = parseCloudinaryUrl(file.url);
  if (!parsed || !parsed.publicId.startsWith(`${RESOURCE_UPLOAD_FOLDER}/`)) {
    return `${label} must be uploaded through the resource uploader.`;
  }
  if (parsed.publicId !== file.publicId || parsed.resourceType !== file.resourceType) {
    return `${label} details don't match the uploaded file.`;
  }
  return null;
}

/** True when any resource row still points at this file URL. */
export async function isResourceFileReferenced(url: string): Promise<boolean> {
  const [row] = await db
    .select({ id: resources.id })
    .from(resources)
    .where(
      or(
        sql`${resources.coverImage} ->> 'url' = ${url}`,
        sql`${resources.attachment} ->> 'url' = ${url}`,
      ),
    )
    .limit(1);
  return !!row;
}

/**
 * Removes files from Cloudinary after the DB change that orphaned them has
 * committed. Best effort: a failure is logged, never surfaced to the admin
 * (the content change already succeeded), and files still referenced by
 * another resource are left alone.
 */
export async function deleteResourceFiles(files: Array<StoredFile | null | undefined>, adminId: string) {
  for (const file of files) {
    if (!file) continue;
    try {
      if (await isResourceFileReferenced(file.url)) continue;
      await deleteUploadedFile(file.url, adminId, { folder: RESOURCE_UPLOAD_FOLDER });
    } catch (error) {
      console.error("Resource file cleanup failed:", file.publicId, error);
    }
  }
}
