import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { duplicateJob } from "@/lib/jobs/queries";
import { serializeJob } from "@/lib/jobs/serializeJob";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Application not found.", 404);

  try {
    const job = await duplicateJob(auth.payload.sub, id);
    if (!job) return fail("Application not found.", 404);
    return ok(serializeJob(job), 201);
  } catch (error) {
    console.error("Failed to duplicate job:", error);
    return fail("Failed to duplicate this application.", 500);
  }
}
