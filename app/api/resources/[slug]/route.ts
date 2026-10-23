import { fail, ok } from "@/lib/api/http";
import { getPublishedResourceBySlug } from "@/lib/resources/queries";

export const runtime = "nodejs";

/** GET /api/resources/:slug - public; 404 for unknown slugs and for drafts alike. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return fail("Resource not found.", 404);

  try {
    const resource = await getPublishedResourceBySlug(slug);
    if (!resource) return fail("Resource not found.", 404);
    // categoryId is an internal detail; everything else is already public-safe.
    const { categoryId: _categoryId, ...publicResource } = resource;
    void _categoryId;
    return ok(publicResource);
  } catch (error) {
    console.error("Failed to load public resource:", error);
    return fail("Failed to load the resource.", 500);
  }
}
