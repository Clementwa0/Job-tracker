import { NextResponse } from "next/server";

import { fail } from "@/lib/api/http";
import { RESOURCE_TYPES, type ResourceType } from "@/lib/resources/constants";
import { listPublishedResources } from "@/lib/resources/queries";
import { parseListParams } from "@/lib/resources/shared";

export const runtime = "nodejs";

/**
 * GET /api/resources?q=&category=<slug>&type=&featured=true&page=&limit=
 * Public. Only ever returns published resources.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const type = params.get("type");
  if (type && !(RESOURCE_TYPES as readonly string[]).includes(type)) return fail("Invalid type filter.", 400);
  const category = params.get("category");
  if (category && !/^[a-z0-9-]{1,80}$/.test(category)) return fail("Invalid category filter.", 400);

  try {
    const result = await listPublishedResources({
      q: params.get("q")?.trim().slice(0, 100) || undefined,
      categorySlug: category ?? undefined,
      type: (type as ResourceType | null) ?? undefined,
      featured: params.get("featured") === "true" ? true : undefined,
      ...parseListParams(params, 12, 50),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list public resources:", error);
    return fail("Failed to load resources.", 500);
  }
}
