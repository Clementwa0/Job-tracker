import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { profileResumes } from "@/lib/db/schema";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { storeUploadedFile, deleteUploadedFile, UploadValidationError } from "@/lib/storage/upload.server";

export const runtime = "nodejs";
const errorResponse = (message: string, status: number) => NextResponse.json({ success: false, message }, { status });

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  const resumes = await db.select().from(profileResumes).where(eq(profileResumes.userId, auth.payload.sub)).orderBy(desc(profileResumes.uploadedAt));
  return NextResponse.json({ success: true, data: resumes });
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return errorResponse("Select a resume.", 400);
  if (!/\.(pdf|doc|docx)$/i.test(file.name)) return errorResponse("Use a PDF, DOC, or DOCX resume.", 400);
  try {
    const uploaded = await storeUploadedFile(file, auth.payload.sub);
    try {
      const [record] = await db.insert(profileResumes).values({
        userId: auth.payload.sub, publicId: uploaded.publicId, secureUrl: uploaded.url,
        resourceType: uploaded.resourceType, format: uploaded.format,
        originalFilename: uploaded.name, size: uploaded.size,
      }).returning();
      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (error) {
      await deleteUploadedFile(uploaded.url, auth.payload.sub).catch((cleanupError) => console.error("Cloudinary cleanup failed:", cleanupError));
      throw error;
    }
  } catch (error) {
    if (error instanceof UploadValidationError) return errorResponse(error.message, 400);
    console.error("Profile resume upload failed:", error);
    return errorResponse("Unable to upload resume.", 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return errorResponse("Invalid resume ID.", 400);
  const [record] = await db.select().from(profileResumes).where(and(eq(profileResumes.id, id), eq(profileResumes.userId, auth.payload.sub))).limit(1);
  if (!record) return errorResponse("Resume not found.", 404);
  try {
    const deleted = await deleteUploadedFile(record.secureUrl, auth.payload.sub);
    if (!deleted) return errorResponse("Unable to delete Cloudinary asset.", 502);
    await db.delete(profileResumes).where(and(eq(profileResumes.id, id), eq(profileResumes.userId, auth.payload.sub)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile resume deletion failed:", error);
    return errorResponse("Unable to delete resume.", 500);
  }
}
