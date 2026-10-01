import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { getProfileResponse, updateProfile } from "@/lib/profile/queries";
import { ProfileInputError, sanitizeProfileInput } from "@/lib/profile/sanitizeProfileInput";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const data = await getProfileResponse(auth.payload.sub);
    if (!data) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load your profile." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);

  try {
    await updateProfile(auth.payload.sub, sanitizeProfileInput(body));

    const data = await getProfileResponse(auth.payload.sub);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ProfileInputError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save your profile." },
      { status: 500 },
    );
  }
}
