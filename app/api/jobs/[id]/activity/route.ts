import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { addActivity } from "@/lib/jobs/queries";
import { JobInputError, sanitizeActivityEntry } from "@/lib/jobs/sanitizeJobInput";
import { serializeJob } from "@/lib/jobs/serializeJob";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

/** Adds a note or reminder to the application's timeline. */
export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Application not found.", 404);

  try {
    const entry = sanitizeActivityEntry(await readJson(request));
    const job = await addActivity(auth.payload.sub, id, entry);
    if (!job) return fail("Application not found.", 404);
    return ok(serializeJob(job), 201);
  } catch (error) {
    if (error instanceof JobInputError) return fail(error.message, 400);
    console.error("Failed to add activity:", error);
    return fail("Failed to add this entry.", 500);
  }
}
