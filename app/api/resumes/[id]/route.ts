import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { deleteResume, getResume, updateResume } from "@/lib/resumes/queries";
import { ResumeInputError, sanitizeResumeInput } from "@/lib/resumes/sanitize";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ success: false, message: "Resume not found." }, { status: 404 });

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const data = await getResume(auth.payload.sub, id);
    if (!data) return notFound();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to load resume:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load this resume." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  const body = await request.json().catch(() => null);

  try {
    const data = await updateResume(auth.payload.sub, id, sanitizeResumeInput(body));
    if (!data) return notFound();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ResumeInputError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Failed to update resume:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save this resume." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const deleted = await deleteResume(auth.payload.sub, id);
    if (!deleted) return notFound();
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete this resume." },
      { status: 500 },
    );
  }
}
