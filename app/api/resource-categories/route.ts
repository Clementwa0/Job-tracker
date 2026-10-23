import { fail, ok } from "@/lib/api/http";
import { listCategories } from "@/lib/resources/categories";

export const runtime = "nodejs";

/** GET /api/resource-categories - public; enabled categories with their published-resource counts. */
export async function GET() {
  try {
    const categories = await listCategories({ publicOnly: true });
    return ok(categories.filter((c) => c.resourceCount > 0));
  } catch (error) {
    console.error("Failed to list public resource categories:", error);
    return fail("Failed to load categories.", 500);
  }
}
