import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import {
  InterviewJobNotFoundError,
  createInterview,
  listInterviews,
} from "@/lib/interviews/queries";
import { InterviewInputError, sanitizeInterviewCreate } from "@/lib/interviews/sanitize";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok(await listInterviews(auth.payload.sub));
  } catch (error) {
    console.error("Failed to list interviews:", error);
    return fail("Failed to load your interviews.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    const input = sanitizeInterviewCreate(await readJson(request));
    return ok(await createInterview(auth.payload.sub, input), 201);
  } catch (error) {
    if (error instanceof InterviewInputError) return fail(error.message, 400);
    if (error instanceof InterviewJobNotFoundError) return fail("Application not found.", 404);
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
      return fail("You already have this interview round scheduled for that time.", 409);
    }
    console.error("Failed to create interview:", error);
    return fail("Failed to schedule the interview.", 500);
  }
}
