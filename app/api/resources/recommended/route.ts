import { fail, ok } from "@/lib/api/http";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { recommendResources } from "@/lib/resources/recommendations";

export const runtime = "nodejs";

/** GET /api/resources/recommended - jobseekers only; based on their applications and interviews. */
export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok(await recommendResources(auth.payload.sub));
  } catch (error) {
    console.error("Failed to build resource recommendations:", error);
    return fail("Failed to load recommendations.", 500);
  }
}
