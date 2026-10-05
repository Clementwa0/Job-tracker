import { NextResponse } from "next/server";
import { fail } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isApplicationStatus, listAdminApplications, parsePagination } from "@/lib/admin/queries";

/** GET /api/admin/applications?status=&q=&page=&limit= (read-only) */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  if (status && !isApplicationStatus(status)) return fail("Invalid status filter.", 400);
  const q = params.get("q")?.trim().slice(0, 100);

  try {
    const result = await listAdminApplications({
      status: status || undefined,
      q: q || undefined,
      ...parsePagination(params),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list admin applications:", error);
    return fail("Failed to load applications.", 500);
  }
}
