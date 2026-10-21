import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { CloudinaryConfigError } from "@/lib/storage/cloudinary.server";
import { deleteUploadedFile, storeUploadedFile, UploadValidationError } from "@/lib/storage/upload.server";

export const runtime = "nodejs";

const fail = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer", "admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) return fail("No file provided.", 400);

  try {
    const stored = await storeUploadedFile(file, auth.payload.sub);

    return NextResponse.json({
      success: true,
      data: {
        url: stored.url,
        name: stored.name,
        type: stored.type,
        size: stored.size,
        publicId: stored.publicId,
        secureUrl: stored.url,
        resourceType: stored.resourceType,
        format: stored.format,
        originalFilename: stored.originalFilename,
        uploadedAt: stored.uploadedAt,
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) return fail(error.message, 400);
    if (error instanceof CloudinaryConfigError) {
      console.error(error.message);
      return fail("File storage is not configured.", 503);
    }
    console.error("File upload failed:", error);
    return fail("Upload failed.", 500);
  }
}

/** Removes a file the caller previously uploaded: DELETE /api/upload?url=<cloudinary url> */
export async function DELETE(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer", "admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const url = new URL(request.url).searchParams.get("url");
  if (!url) return fail("No file URL provided.", 400);

  try {
    const deleted = await deleteUploadedFile(url, auth.payload.sub);
    if (!deleted) return fail("File not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete failed:", error);
    return fail("Delete failed.", 500);
  }
}
