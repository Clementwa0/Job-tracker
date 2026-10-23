import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { fileRefErrors, validationFail } from "@/lib/resources/api";
import { deleteResourceFiles } from "@/lib/resources/files";
import { deleteResource, getAdminResource, updateResource } from "@/lib/resources/queries";
import { resourceInputSchema } from "@/lib/resources/schema";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/admin/resources/:id - full resource (drafts included) for the edit form. */
export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Resource not found.", 404);

  try {
    const resource = await getAdminResource(id);
    return resource ? ok(resource) : fail("Resource not found.", 404);
  } catch (error) {
    console.error("Failed to load resource:", error);
    return fail("Failed to load the resource.", 500);
  }
}

/** PATCH /api/admin/resources/:id - save the whole edit form. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Resource not found.", 404);

  const parsed = resourceInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const refErrors = fileRefErrors(parsed.data);
  if (refErrors) return validationFail(refErrors);

  try {
    const result = await updateResource(id, parsed.data, auth.payload.sub);
    if (result.ok) {
      // Replaced / removed files are deleted only after the change committed.
      await deleteResourceFiles(result.removedFiles, auth.payload.sub);
      return ok(result.resource);
    }
    if (result.reason === "not_found") return fail("Resource not found.", 404);
    if (result.reason === "category_not_found") return validationFail({ categoryId: "That category no longer exists." });
    return validationFail(result.issues, "This resource isn't ready to publish.");
  } catch (error) {
    console.error("Failed to update resource:", error);
    return fail("Failed to update the resource.", 500);
  }
}

/** DELETE /api/admin/resources/:id - removes the resource, its bookmarks and its Cloudinary files. */
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Resource not found.", 404);

  try {
    const result = await deleteResource(id, auth.payload.sub);
    if (!result.ok) return fail("Resource not found.", 404);
    await deleteResourceFiles(result.files, auth.payload.sub);
    return ok({ id });
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return fail("Failed to delete the resource.", 500);
  }
}
