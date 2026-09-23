import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import { deleteInterview, getInterview, updateInterview } from "@/lib/interviews/queries";
import { InterviewInputError, sanitizeInterviewUpdate } from "@/lib/interviews/sanitize";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

const notFound = () => fail("Interview not found.", 404);

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const interview = await getInterview(auth.payload.sub, id);
    return interview ? ok(interview) : notFound();
  } catch (error) {
    console.error("Failed to load interview:", error);
    return fail("Failed to load this interview.", 500);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const patch = sanitizeInterviewUpdate(await readJson(request));
    const interview = await updateInterview(auth.payload.sub, id, patch);
    return interview ? ok(interview) : notFound();
  } catch (error) {
    if (error instanceof InterviewInputError) return fail(error.message, 400);
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
      return fail("You already have this interview round scheduled for that time.", 409);
    }
    console.error("Failed to update interview:", error);
    return fail("Failed to update this interview.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    if (!(await deleteInterview(auth.payload.sub, id))) return notFound();
    // The client reads `message` from the top level of the response.
    return NextResponse.json({ success: true, message: "Interview deleted", data: null });
  } catch (error) {
    console.error("Failed to delete interview:", error);
    return fail("Failed to delete this interview.", 500);
  }
}
