import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/adminAuth";
import { setRefreshCookie } from "@/lib/auth/cookies";
import { serializeUser } from "@/lib/auth/serializeUser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const result = await authenticateAdmin(email, password);

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
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { success: false, message: "Sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}
