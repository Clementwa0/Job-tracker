import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { authenticatedDeliveryUrl, CloudinaryConfigError } from "@/lib/storage/cloudinary.server";
import { deletePrivateUploadedFile, deleteUploadedFile, privateUploadResourceType, storeUploadedFile, UploadValidationError } from "@/lib/storage/upload.server";

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
    const privateFile = formData?.get("private") === "true";
    const stored = await storeUploadedFile(file, auth.payload.sub, privateFile);

    return NextResponse.json({
      success: true,
      data: {
        url: stored.url,
        publicId: privateFile ? stored.publicId : undefined,
        name: stored.name,
        type: stored.type,
        size: stored.size,
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

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer", "admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const publicId = new URL(request.url).searchParams.get("publicId");
  const resourceType = publicId
    ? privateUploadResourceType(publicId, auth.payload.sub)
    : null;
  if (!publicId || !resourceType) {
    return fail("File not found.", 404);
  }

  try {
    const source = await fetch(authenticatedDeliveryUrl(publicId, resourceType), {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!source.ok) return fail("File not found.", 404);
    const filename = publicId.split("/").at(-1)!.replace(/[^\w.-]/g, "_");
    return new Response(source.body, {
      headers: {
        "Content-Type": source.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof CloudinaryConfigError) return fail("File storage is not configured.", 503);
    console.error("File download failed:", error);
    return fail("Download failed.", 502);
  }
}

/** Removes a file the caller previously uploaded: DELETE /api/upload?url=<cloudinary url> */
export async function DELETE(request: Request) {
  const auth = await requireActiveAccount(request, ["user", "employer", "admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const requestUrl = new URL(request.url);
  const url = requestUrl.searchParams.get("url");
  const publicId = requestUrl.searchParams.get("publicId");
  if (!url && !publicId) return fail("No file identifier provided.", 400);

  try {
    const deleted = publicId
      ? await deletePrivateUploadedFile(publicId, auth.payload.sub)
      : await deleteUploadedFile(url!, auth.payload.sub);
    if (!deleted) return fail("File not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete failed:", error);
    return fail("Delete failed.", 500);
  }
}
