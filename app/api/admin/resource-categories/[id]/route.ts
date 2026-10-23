import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isUuid } from "@/lib/uuid";
import { validationFail } from "@/lib/resources/api";
import { deleteCategory, updateCategory } from "@/lib/resources/categories";
import { categoryInputSchema } from "@/lib/resources/schema";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** PATCH /api/admin/resource-categories/:id - any of `{ name, description, isActive }` */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Category not found.", 404);

  const parsed = categoryInputSchema.partial().safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  if (Object.keys(parsed.data).length === 0) return fail("Nothing to update.", 400);

  try {
    const result = await updateCategory(id, parsed.data, auth.payload.sub);
    if (result.ok) return ok(result.category);
    if (result.reason === "not_found") return fail("Category not found.", 404);
    return validationFail({ name: "A category with this name already exists." });
  } catch (error) {
    console.error("Failed to update resource category:", error);
    return fail("Failed to update the category.", 500);
  }
}

/** DELETE /api/admin/resource-categories/:id - only when no resource uses it. */
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const { id } = await params;
  if (!isUuid(id)) return fail("Category not found.", 404);

  try {
    const result = await deleteCategory(id, auth.payload.sub);
    if (result.ok) return ok({ id });
    if (result.reason === "not_found") return fail("Category not found.", 404);
    return fail(
      `This category is used by ${result.resourceCount} ${result.resourceCount === 1 ? "resource" : "resources"}. Reassign or delete them first, or disable the category instead.`,
      409,
    );
  } catch (error) {
    console.error("Failed to delete resource category:", error);
    return fail("Failed to delete the category.", 500);
  }
}
