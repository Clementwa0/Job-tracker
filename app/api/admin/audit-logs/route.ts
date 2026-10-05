import { NextResponse } from "next/server";
import { fail } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { listAdminAuditLogs, parsePagination } from "@/lib/admin/queries";

/** GET /api/admin/audit-logs?page=&limit= */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    const result = await listAdminAuditLogs(parsePagination(new URL(request.url).searchParams));
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to list audit logs:", error);
    return fail("Failed to load the audit log.", 500);
  }
}
