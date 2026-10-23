import { randomUUID } from "crypto";
import path from "path";
import {
  deleteFromCloudinary,
  parseCloudinaryUrl,
  uploadToCloudinary,
  type CloudinaryResourceType,
} from "@/lib/storage/cloudinary.server";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_BYTES = 3 * 1024 * 1024;

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

/**
 * Optional narrowing for callers that don't want the full default policy
 * (every existing caller passes none and behaves exactly as before).
 */
export interface StoreOptions {
  /** Cloudinary folder to store in instead of `jobtrail/<userId>` (shared, non per-user assets). */
  folder?: string;
  /** Only accept these MIME types (a subset of the supported types). */
  allowedMimeTypes?: readonly string[];
  /** Per-file size cap in bytes; may only be stricter than the defaults. */
  maxBytes?: number;
}

export async function storeUploadedFile(file: File, userId: string, options: StoreOptions = {}) {
  if (file.size === 0) throw new UploadValidationError("The file is empty.");
  if (file.size > MAX_UPLOAD_SIZE_BYTES) throw new UploadValidationError("File exceeds 5MB.");
  if (options.maxBytes !== undefined && file.size > options.maxBytes) {
    throw new UploadValidationError(`File exceeds ${Math.round((options.maxBytes / (1024 * 1024)) * 10) / 10} MB.`);
  }

  const extension = path.extname(file.name).toLowerCase();
  const spec = FILE_TYPES[file.type] || Object.values(FILE_TYPES).find((candidate) => candidate.ext === extension);
  if (!spec) throw new UploadValidationError("Unsupported file type.");
  if (options.allowedMimeTypes) {
    const mime = Object.entries(FILE_TYPES).find(([, candidate]) => candidate === spec)?.[0];
    if (!mime || !options.allowedMimeTypes.includes(mime)) {
      throw new UploadValidationError("This file type isn't allowed here.");
    }
  }
  if (extension !== spec.ext && !(spec.ext === ".jpg" && extension === ".jpeg")) {
    throw new UploadValidationError("File extension does not match the declared file type.");
  }

  if (spec.resourceType === "raw" && file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new UploadValidationError("Document files must be 3 MB or smaller.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!spec.matches(bytes)) throw new UploadValidationError("The file's contents don't match its type.");

  // Raw assets keep the public_id verbatim, so the extension must be part of it
  // for the delivery URL to end in .pdf/.docx; images get their format appended by Cloudinary.
  const id = randomUUID();
  const folder = options.folder ?? `${FOLDER}/${userId}`;
  const publicId = `${folder}/${spec.resourceType === "raw" ? `${id}${spec.ext}` : id}`;
  const mimeType = Object.entries(FILE_TYPES).find(([, candidate]) => candidate === spec)?.[0] ?? file.type;

  const uploaded = await uploadToCloudinary({
    bytes,
    publicId,
    resourceType: spec.resourceType,
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
    resourceType: uploaded.resourceType,
    format: uploaded.format,
    originalFilename: uploaded.originalFilename,
    uploadedAt: uploaded.uploadedAt,
  };
}

/**
 * Deletes a previously uploaded file. Only assets inside the caller's own
 * folder (or the explicit shared `folder`) can be removed; legacy
 * `/uploads/...` URLs are ignored.
 */
export async function deleteUploadedFile(
  url: string,
  userId: string,
  options: Pick<StoreOptions, "folder"> = {},
): Promise<boolean> {
  const parsed = parseCloudinaryUrl(url);
  const folder = options.folder ?? `${FOLDER}/${userId}`;
  if (!parsed || !parsed.publicId.startsWith(`${folder}/`)) return false;
  await deleteFromCloudinary(parsed.publicId, parsed.resourceType);
  return true;
}
