import { NextResponse } from "next/server";
import { authenticateWithGoogle } from "@/lib/auth/googleAuth";
import { setRefreshCookie } from "@/lib/auth/cookies";
import { serializeUser } from "@/lib/auth/serializeUser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken = typeof body?.idToken === "string" ? body.idToken : null;

  if (!idToken) {
    return NextResponse.json(
      { success: false, message: "Missing Google ID token." },
      { status: 400 },
    );
  }

  try {
    const result = await authenticateWithGoogle(idToken, "user");

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status },
      );
    }

    await setRefreshCookie(result.refreshToken);

    return NextResponse.json({
      success: true,
      data: { user: serializeUser(result.user), token: result.accessToken },
    });
  } catch (error) {
    console.error("Jobseeker Google sign-in failed:", error);
    return NextResponse.json(
      { success: false, message: "Google sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}
