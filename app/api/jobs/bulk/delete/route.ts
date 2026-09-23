import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { parseIdList } from "@/lib/api/ids";
import { bulkDeleteJobs } from "@/lib/jobs/queries";

/** Body: `{ ids: string[] }`. Ids that aren't the caller's are ignored. */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const body = await readJson(request);
  const parsed = parseIdList(
    body && typeof body === "object" ? (body as { ids?: unknown }).ids : undefined,
  );
  if ("error" in parsed) return fail(parsed.error, 400);

  try {
    return ok({ deleted: await bulkDeleteJobs(auth.payload.sub, parsed.ids) });
  } catch (error) {
    console.error("Bulk job delete failed:", error);
    return fail("Failed to delete the selected applications.", 500);
  }
}
