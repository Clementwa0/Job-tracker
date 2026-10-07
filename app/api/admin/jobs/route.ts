import { NextResponse } from "next/server";
import { fail } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { isPostingStatus, listAdminJobs, parsePagination } from "@/lib/admin/queries";

/** GET /api/admin/jobs?status=&q=&page=&limit= */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  if (status && !isPostingStatus(status)) return fail("Invalid status filter.", 400);
  const q = params.get("q")?.trim().slice(0, 100);

  try {
    const result = await listAdminJobs({
      status: status && isPostingStatus(status) ? status : undefined,
      q: q || undefined,
      ...parsePagination(params),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list admin jobs:", error);
    return fail("Failed to load job postings.", 500);
  }
}
