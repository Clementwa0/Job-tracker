import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { SavedJobLimitError, listSavedJobs, saveJob } from "@/lib/savedJobs/queries";
import { SavedJobInputError, sanitizeSavedJobInput } from "@/lib/savedJobs/sanitize";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const data = await listSavedJobs(auth.payload.sub);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to list saved jobs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load your saved jobs." },
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
    const { created, job } = await saveJob(auth.payload.sub, sanitizeSavedJobInput(body));
    return NextResponse.json(
      { success: true, data: { job, created } },
      { status: created ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof SavedJobInputError || error instanceof SavedJobLimitError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Failed to save job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save this job." },
      { status: 500 },
    );
  }
}
