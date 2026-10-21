import { randomUUID } from "crypto";
import path from "path";
import {
  deleteFromCloudinary,
  parseCloudinaryUrl,
  uploadToCloudinary,
  type CloudinaryResourceType,
} from "@/lib/storage/cloudinary.server";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

/** Every asset lives under this folder, then a per-user subfolder. */
const FOLDER = "jobtrail";

const FILE_TYPES: Record<
  string,
  { ext: string; resourceType: CloudinaryResourceType; matches: (bytes: Buffer) => boolean }
> = {
  "application/pdf": {
    ext: ".pdf",
    resourceType: "raw",
    matches: (bytes) => bytes.subarray(0, 5).toString("latin1") === "%PDF-",
  },
  "application/msword": {
    ext: ".doc",
    resourceType: "raw",
    matches: (bytes) => bytes.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: ".docx",
    resourceType: "raw",
    matches: (bytes) => bytes.subarray(0, 4).toString("hex") === "504b0304",
  },
  "text/plain": {
    ext: ".txt",
    resourceType: "raw",
    // Plain text has no magic number: reject binary content (NUL bytes).
    matches: (bytes) => !bytes.includes(0),
  },
  "image/png": {
    ext: ".png",
    resourceType: "image",
    matches: (bytes) => bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a",
  },
  "image/jpeg": {
    ext: ".jpg",
    resourceType: "image",
    matches: (bytes) => bytes.subarray(0, 3).toString("hex") === "ffd8ff",
  },
  "image/webp": {
    ext: ".webp",
    resourceType: "image",
    matches: (bytes) =>
      bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP",
  },
};

export class UploadValidationError extends Error {}

export async function storeUploadedFile(file: File, userId: string, privateFile = false) {
  if (file.size === 0) throw new UploadValidationError("The file is empty.");
  if (file.size > MAX_UPLOAD_SIZE_BYTES) throw new UploadValidationError("File exceeds 5MB.");

  const extension = path.extname(file.name).toLowerCase();
  const spec = FILE_TYPES[file.type] || Object.values(FILE_TYPES).find((candidate) => candidate.ext === extension);
  if (!spec) throw new UploadValidationError("Unsupported file type.");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!spec.matches(bytes)) throw new UploadValidationError("The file's contents don't match its type.");

  // Raw assets keep the public_id verbatim, so the extension must be part of it
  // for the delivery URL to end in .pdf/.docx; images get their format appended by Cloudinary.
  const id = randomUUID();
  const publicId = `${FOLDER}/${userId}/${spec.resourceType === "raw" ? `${id}${spec.ext}` : id}`;
  const mimeType = Object.entries(FILE_TYPES).find(([, candidate]) => candidate === spec)?.[0] ?? file.type;

  const uploaded = await uploadToCloudinary({
    bytes,
    publicId,
    resourceType: spec.resourceType,
    deliveryType: privateFile ? "authenticated" : "upload",
    mimeType,
    filename: file.name,
  });

  return {
    url: uploaded.url,
    publicId: uploaded.publicId,
    extension: spec.ext,
    name: file.name,
    type: mimeType,
    size: file.size,
    bytes,
  };
}

/**
 * Deletes a previously uploaded file. Only assets inside the caller's own
 * folder can be removed; legacy `/uploads/...` URLs are ignored.
 */
export async function deleteUploadedFile(url: string, userId: string): Promise<boolean> {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed || !parsed.publicId.startsWith(`${FOLDER}/${userId}/`)) return false;
  await deleteFromCloudinary(parsed.publicId, parsed.resourceType);
  return true;
}

export async function deletePrivateUploadedFile(publicId: string, userId: string): Promise<boolean> {
  const resourceType = privateUploadResourceType(publicId, userId);
  if (!resourceType) return false;
  await deleteFromCloudinary(publicId, resourceType, "authenticated");
  return true;
}

export function privateUploadResourceType(
  publicId: string,
  userId: string,
): CloudinaryResourceType | null {
  const prefix = `${FOLDER}/${userId}/`;
  if (!publicId.startsWith(prefix)) return null;
  const filename = publicId.slice(prefix.length);
  if (/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(filename)) {
    return "image";
  }
  if (/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(?:pdf|doc|docx|txt)$/i.test(filename)) {
    return "raw";
  }
  return null;
}
