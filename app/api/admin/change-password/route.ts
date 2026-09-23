import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { changeAdminPassword } from "@/lib/auth/adminAuth";

export async function POST(request: Request) {
  const auth = requireRole(request, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : null;
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : null;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, message: "Current and new password are required." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, message: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const result = await changeAdminPassword(auth.payload.sub, currentPassword, newPassword);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin change-password failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't update password. Please try again." },
      { status: 500 },
    );
  }
}
