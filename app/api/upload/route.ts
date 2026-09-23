import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { storeUploadedFile, UploadValidationError } from "@/lib/storage/upload.server";

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
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) return fail(error.message, 400);
    console.error("File upload failed:", error);
    return fail("Upload failed.", 500);
  }
}
