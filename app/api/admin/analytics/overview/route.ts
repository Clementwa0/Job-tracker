import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/admin/analytics";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try { return NextResponse.json({ success: true, data: await getAdminOverview() }); }
  catch (error) { console.error("Failed to load admin overview:", error); return NextResponse.json({ success: false, message: "Failed to load admin overview." }, { status: 500 }); }
}