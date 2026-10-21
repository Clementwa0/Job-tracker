import { createHash } from "crypto";

/**
 * Minimal Cloudinary client over the signed REST API. Uses fetch + SHA-1
 * signing so no SDK dependency is needed.
 *
 * Config (server-only): either CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD
 * or the three CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
 */

export type CloudinaryResourceType = "image" | "raw";
type CloudinaryDeliveryType = "upload" | "authenticated";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class CloudinaryConfigError extends Error {}
export class CloudinaryRequestError extends Error {}

export function getCloudinaryConfig(): CloudinaryConfig {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
    if (match) return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryConfigError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
  bytes: number;
}

/**
 * Uploads a buffer. For `raw` resources (pdf/doc/docx/txt) Cloudinary keeps the
 * public_id verbatim, so the caller must include the file extension in it.
 */
export async function uploadToCloudinary(opts: {
  bytes: Buffer;
  publicId: string;
  resourceType: CloudinaryResourceType;
  deliveryType?: CloudinaryDeliveryType;
  mimeType: string;
  filename: string;
}): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const deliveryType = opts.deliveryType ?? "upload";
  const signed = { overwrite: "false", public_id: opts.publicId, timestamp, type: deliveryType };
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(opts.bytes)], { type: opts.mimeType }), opts.filename);
  form.append("api_key", apiKey);
  form.append("signature", sign(signed, apiSecret));
  for (const [key, value] of Object.entries(signed)) form.append(key, value);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${opts.resourceType}/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await response.json().catch(() => null)) as
    | { public_id?: string; secure_url?: string; bytes?: number; error?: { message?: string } }
    | null;

  if (!response.ok || !json?.secure_url || !json.public_id) {
    throw new CloudinaryRequestError(json?.error?.message || `Cloudinary upload failed (${response.status}).`);
  }
  return {
    publicId: json.public_id,
    url: deliveryType === "authenticated"
      ? `/api/upload?publicId=${encodeURIComponent(json.public_id)}`
      : json.secure_url,
    resourceType: opts.resourceType,
    deliveryType,
    bytes: json.bytes ?? opts.bytes.length,
  };
}

export function authenticatedDeliveryUrl(publicId: string, resourceType: CloudinaryResourceType): string {
  const { cloudName, apiSecret } = getCloudinaryConfig();
  const signature = createHash("sha1")
    .update(`${publicId}${apiSecret}`)
    .digest("base64")
    .slice(0, 8)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const encodedPublicId = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/authenticated/s--${signature}--/${encodedPublicId}`;
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: CloudinaryResourceType,
  deliveryType: CloudinaryDeliveryType = "upload",
): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = { invalidate: "true", public_id: publicId, timestamp, type: deliveryType };

  const body = new URLSearchParams({ ...signed, api_key: apiKey, signature: sign(signed, apiSecret) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new CloudinaryRequestError(`Cloudinary delete failed (${response.status}).`);
}

/**
 * Splits a Cloudinary delivery URL into the parts needed to delete it.
 * Returns null for anything that isn't a Cloudinary URL for our cloud
 * (e.g. legacy `/uploads/...` paths).
 *   https://res.cloudinary.com/<cloud>/<image|raw>/upload/[v123/]<public_id>
 */
export function parseCloudinaryUrl(
  url: string,
): { publicId: string; resourceType: CloudinaryResourceType } | null {
  let cloudName: string;
  try {
    cloudName = getCloudinaryConfig().cloudName;
  } catch {
    return null;
  }
  const match = new RegExp(
    `^https://res\\.cloudinary\\.com/${cloudName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(image|raw)/upload/(?:v\\d+/)?(.+)$`,
  ).exec(url);
  if (!match) return null;
  const resourceType = match[1] as CloudinaryResourceType;
  let publicId = decodeURIComponent(match[2]);
  // Image public_ids are stored without extension; the delivery URL has one.
  if (resourceType === "image") publicId = publicId.replace(/\.[a-z0-9]+$/i, "");
  return { publicId, resourceType };
}
