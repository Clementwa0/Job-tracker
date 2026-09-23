import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { fail, ok } from "@/lib/api/http";
import { getAnalyticsSummary } from "@/lib/jobs/analytics";

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return fail(auth.message, auth.status);

  try {
    return ok(await getAnalyticsSummary(auth.payload.sub));
  } catch (error) {
    console.error("Failed to build analytics summary:", error);
    return fail("Failed to load your analytics.", 500);
  }
}
