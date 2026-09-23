import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { getRecommendations } from "@/lib/recommendations/queries";

const DEFAULT_LIMIT = 4;
const MAX_LIMIT = 20;

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const raw = Number.parseInt(new URL(request.url).searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(raw) ? Math.min(MAX_LIMIT, Math.max(1, raw)) : DEFAULT_LIMIT;

  try {
    const data = await getRecommendations(auth.payload.sub, limit);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to build recommendations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load recommendations." },
      { status: 500 },
    );
  }
}
