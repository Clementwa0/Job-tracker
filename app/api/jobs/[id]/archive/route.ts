import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { setArchived } from "@/lib/jobs/queries";
import { serializeJob } from "@/lib/jobs/serializeJob";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

/** Body: `{ archive?: boolean }` — archives by default, `false` restores. */
export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Application not found.", 404);

  const body = await readJson(request);
  const archive =
    body && typeof body === "object" && "archive" in body
      ? (body as { archive: unknown }).archive
      : true;
  if (typeof archive !== "boolean") return fail('"archive" must be true or false.', 400);

  try {
    const job = await setArchived(auth.payload.sub, id, archive);
    if (!job) return fail("Application not found.", 404);
    return ok(serializeJob(job));
  } catch (error) {
    console.error("Failed to archive job:", error);
    return fail("Failed to update this application.", 500);
  }
}
