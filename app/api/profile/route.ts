import { NextResponse } from "next/server";

import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import {
  getProfileResponse,
  updateProfile,
} from "@/lib/profile/queries";
import {
  ProfileInputError,
  sanitizeProfileInput,
} from "@/lib/profile/sanitizeProfileInput";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

/* -------------------------------------------------------------------------- */
/* GET /api/profile                                                           */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return json({ success: false, message: auth.message }, auth.status);
  }

  try {
    const data = await getProfileResponse(auth.payload.sub);

    if (!data) {
      return json(
        { success: false, message: "Account not found." },
        404,
      );
    }

    return json({ success: true, data });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return json(
      { success: false, message: "Failed to load your profile." },
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PUT /api/profile                                                           */
/* -------------------------------------------------------------------------- */

export async function PUT(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return json({ success: false, message: auth.message }, auth.status);
  }

  /* ---- Parse body (reject malformed JSON up front) ---------------------- */

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      { success: false, message: "Invalid request body." },
      400,
    );
  }

  /* ---- Validate, save, and return fresh state --------------------------- */

  try {
    const patch = sanitizeProfileInput(body);

    /*
     * If updateProfile is ever refactored to return the enriched
     * profile shape (the same as GET), the follow-up read can be
     * skipped. Until then, re-read to guarantee the client gets the
     * canonical server copy (completeness, timestamps, etc.).
     */
    await updateProfile(auth.payload.sub, patch);

    const data = await getProfileResponse(auth.payload.sub);

    if (!data) {
      return json(
        { success: false, message: "Account not found." },
        404,
      );
    }

    return json({ success: true, data });
  } catch (error) {
    if (error instanceof ProfileInputError) {
      return json({ success: false, message: error.message }, 400);
    }

    console.error("Failed to update profile:", error);
    return json(
      { success: false, message: "Failed to save your profile." },
      500,
    );
  }
}