import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

const FILE_TYPES: Record<string, { ext: string; matches: (bytes: Buffer) => boolean }> = {
  "application/pdf": {
    ext: ".pdf",
    matches: (bytes) => bytes.subarray(0, 5).toString("latin1") === "%PDF-",
  },
  "application/msword": {
    ext: ".doc",
    matches: (bytes) => bytes.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: ".docx",
    matches: (bytes) => bytes.subarray(0, 4).toString("hex") === "504b0304",
  },
  "image/png": { ext: ".png", matches: (bytes) => bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" },
  "image/jpeg": { ext: ".jpg", matches: (bytes) => bytes.subarray(0, 3).toString("hex") === "ffd8ff" },
  "image/webp": {
    ext: ".webp",
    matches: (bytes) => bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP",
  },
};

export class UploadValidationError extends Error {}

export async function storeUploadedFile(file: File, userId: string) {
  if (file.size === 0) throw new UploadValidationError("The file is empty.");
  if (file.size > MAX_UPLOAD_SIZE_BYTES) throw new UploadValidationError("File exceeds 5MB.");

  const extension = path.extname(file.name).toLowerCase();
  const spec = FILE_TYPES[file.type] || Object.values(FILE_TYPES).find((candidate) => candidate.ext === extension);
  if (!spec) throw new UploadValidationError("Unsupported file type.");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!spec.matches(bytes)) throw new UploadValidationError("The file's contents don't match its type.");

  const filename = `${randomUUID()}${spec.ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  return {
    url: `/uploads/${userId}/${filename}`,
    extension: spec.ext,
    name: file.name,
    type: file.type,
    size: file.size,
    bytes,
  };
}