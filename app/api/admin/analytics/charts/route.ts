import { NextResponse } from "next/server";
import { getAdminCharts } from "@/lib/admin/analytics";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import type { AdminAnalyticsPeriod } from "@/types/admin";

const PERIODS: AdminAnalyticsPeriod[] = ["7d", "30d", "90d", "12m", "all"];

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["admin"]);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  const requested = new URL(request.url).searchParams.get("period") as AdminAnalyticsPeriod | null;
  const period = requested && PERIODS.includes(requested) ? requested : "30d";
  try { return NextResponse.json({ success: true, data: await getAdminCharts(period) }); }
  catch (error) { console.error("Failed to load admin charts:", error); return NextResponse.json({ success: false, message: "Failed to load admin charts." }, { status: 500 }); }
}