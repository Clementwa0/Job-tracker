import { NextResponse } from "next/server";

import { fail, ok, readJson } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { validationFail } from "@/lib/resources/api";
import { createCategory, listCategories } from "@/lib/resources/categories";
import { categoryInputSchema } from "@/lib/resources/schema";

export const runtime = "nodejs";

/** GET /api/admin/resource-categories - every category (disabled too) with resource counts. */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return NextResponse.json({ success: true, data: await listCategories() });
  } catch (error) {
    console.error("Failed to list resource categories:", error);
    return fail("Failed to load categories.", 500);
  }
}

/** POST /api/admin/resource-categories - body `{ name, description?, isActive? }` */
export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const parsed = categoryInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);

  try {
    const result = await createCategory(parsed.data, auth.payload.sub);
    if (result.ok) return ok(result.category, 201);
    return validationFail({ name: "A category with this name already exists." });
  } catch (error) {
    console.error("Failed to create resource category:", error);
    return fail("Failed to create the category.", 500);
  }
}
