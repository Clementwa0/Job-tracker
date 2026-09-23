import { NextResponse } from "next/server";
import { getAdminAnalytics, getAdminOverview } from "@/lib/admin/analytics";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const [overview, analytics] = await Promise.all([getAdminOverview(), getAdminAnalytics()]);
    return NextResponse.json({ success: true, data: { overview, analytics } });
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return NextResponse.json({ success: false, message: "Failed to load admin dashboard." }, { status: 500 });
  }
}