import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { getJobStats } from "@/lib/jobs/stats";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const data = await getJobStats(auth.payload.sub);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to compute job stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load your statistics." },
      { status: 500 },
    );
  }
}
