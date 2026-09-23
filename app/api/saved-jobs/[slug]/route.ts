import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok, readJson } from "@/lib/api/http";
import { getSavedJob, removeSavedJob, updateSavedJob } from "@/lib/savedJobs/queries";
import {
  SavedJobInputError,
  isValidSlug,
  sanitizeSavedJobUpdate,
} from "@/lib/savedJobs/sanitize";

type RouteParams = { params: Promise<{ slug: string }> };

const notFound = () => fail("Saved job not found.", 404);

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { slug } = await params;
  if (!isValidSlug(slug)) return notFound();

  try {
    const job = await getSavedJob(auth.payload.sub, slug);
    return job ? ok(job) : notFound();
  } catch (error) {
    console.error("Failed to load saved job:", error);
    return fail("Failed to load this saved job.", 500);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { slug } = await params;
  if (!isValidSlug(slug)) return notFound();

  try {
    const patch = sanitizeSavedJobUpdate(await readJson(request));
    const job = await updateSavedJob(auth.payload.sub, slug, patch);
    return job ? ok(job) : notFound();
  } catch (error) {
    if (error instanceof SavedJobInputError) return fail(error.message, 400);
    console.error("Failed to update saved job:", error);
    return fail("Failed to update this saved job.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { slug } = await params;
  // Nothing valid can be stored under a malformed slug, so there's nothing to remove.
  if (!isValidSlug(slug)) return ok({ removed: false });

  try {
    return ok({ removed: await removeSavedJob(auth.payload.sub, slug) });
  } catch (error) {
    console.error("Failed to remove saved job:", error);
    return fail("Failed to remove this saved job.", 500);
  }
}
