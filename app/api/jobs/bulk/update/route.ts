import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { parseIdList } from "@/lib/api/ids";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import { bulkUpdateJobs } from "@/lib/jobs/queries";
import { JobInputError, sanitizeJobInput } from "@/lib/jobs/sanitizeJobInput";

/** Body: `{ ids: string[], patch: {...job fields} }`. */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const body = await readJson(request);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);
  const { ids: rawIds, patch } = body as { ids?: unknown; patch?: unknown };

  const parsed = parseIdList(rawIds);
  if ("error" in parsed) return fail(parsed.error, 400);
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return fail('"patch" must be an object.', 400);
  }

  try {
    const input = sanitizeJobInput(patch as Record<string, unknown>);

    const { jobTitle, companyName } = input.values;
    if (
      (jobTitle !== undefined && !jobTitle.trim()) ||
      (companyName !== undefined && !companyName.trim())
    ) {
      return fail("Job title and company name can't be empty.", 400);
    }
    if (Object.keys(input.values).length === 0) return fail("Nothing to update.", 400);
    // A posting link is unique per application; it can't be shared across a bulk edit.
    if (input.values.jobPostingId !== undefined) {
      return fail('"jobPostingId" can\'t be changed in bulk.', 400);
    }

    return ok(await bulkUpdateJobs(auth.payload.sub, parsed.ids, input));
  } catch (error) {
    if (error instanceof JobInputError) return fail(error.message, 400);
    const code = pgErrorCode(error);
    if (code === PG_UNIQUE_VIOLATION || code === PG_FOREIGN_KEY_VIOLATION) {
      return fail("Those changes conflict with existing data.", 409);
    }
    console.error("Bulk job update failed:", error);
    return fail("Failed to update the selected applications.", 500);
  }
}
