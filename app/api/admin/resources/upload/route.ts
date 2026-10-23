import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { CloudinaryConfigError } from "@/lib/storage/cloudinary.server";
import { deleteUploadedFile, storeUploadedFile, UploadValidationError } from "@/lib/storage/upload.server";
import {
  ATTACHMENT_MIME_TYPES,
  COVER_IMAGE_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_COVER_IMAGE_BYTES,
  RESOURCE_UPLOAD_FOLDER,
  type StoredFile,
} from "@/lib/resources/constants";
import { isResourceFileReferenced } from "@/lib/resources/files";

export const runtime = "nodejs";

/**
 * POST /api/admin/resources/upload  (multipart: file, kind = "cover" | "attachment")
 * Stores the file in Cloudinary (never on disk) and returns its metadata. The
 * resource itself is only changed when the form is saved.
 */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");
  if (!(file instanceof File)) return fail("No file provided.", 400);
  if (kind !== "cover" && kind !== "attachment") return fail('"kind" must be "cover" or "attachment".', 400);

  try {
    const stored = await storeUploadedFile(file, auth.payload.sub, {
      folder: RESOURCE_UPLOAD_FOLDER,
      allowedMimeTypes: kind === "cover" ? COVER_IMAGE_MIME_TYPES : ATTACHMENT_MIME_TYPES,
      maxBytes: kind === "cover" ? MAX_COVER_IMAGE_BYTES : MAX_ATTACHMENT_BYTES,
    });

    const data: StoredFile = {
      publicId: stored.publicId,
      url: stored.url,
      fileType: stored.type,
      originalFilename: stored.name,
      size: stored.size,
      resourceType: stored.resourceType,
    };
    return ok(data, 201);
  } catch (error) {
    if (error instanceof UploadValidationError) return fail(error.message, 400);
    if (error instanceof CloudinaryConfigError) {
      console.error(error.message);
      return fail("File storage is not configured.", 503);
    }
    console.error("Resource upload failed:", error);
    return fail("Upload failed.", 500);
  }
}

/**
 * DELETE /api/admin/resources/upload?url=<cloudinary url>
 * Discards a file uploaded in the form but never saved. Files still attached
 * to a saved resource are refused - those are removed by saving the resource.
 */
export async function DELETE(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const url = new URL(request.url).searchParams.get("url");
  if (!url) return fail("No file URL provided.", 400);

  try {
    if (await isResourceFileReferenced(url)) {
      return fail("This file is attached to a saved resource. Remove it in the editor and save instead.", 409);
    }
    const deleted = await deleteUploadedFile(url, auth.payload.sub, { folder: RESOURCE_UPLOAD_FOLDER });
    return deleted ? ok({ deleted: true }) : fail("File not found.", 404);
  } catch (error) {
    console.error("Resource file delete failed:", error);
    return fail("Delete failed.", 500);
  }
}
