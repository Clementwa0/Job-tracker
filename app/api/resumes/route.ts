import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { ResumeLimitError, createResume, listResumes } from "@/lib/resumes/queries";
import { ResumeInputError, sanitizeResumeInput } from "@/lib/resumes/sanitize";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const data = await listResumes(auth.payload.sub);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to list resumes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load your resumes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);

  try {
    const data = await createResume(auth.payload.sub, sanitizeResumeInput(body));
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ResumeInputError || error instanceof ResumeLimitError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Failed to create resume:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create the resume." },
      { status: 500 },
    );
  }
}
