import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 40;
const requests = new Map<string, number[]>();

export async function authorizeAiRequest(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) return { response: NextResponse.json({ success: false, message: auth.message }, { status: auth.status }) };

  const now = Date.now();
  const recent = (requests.get(auth.payload.sub) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return { response: NextResponse.json({ success: false, message: "AI rate limit exceeded. Try again later." }, { status: 429 }) };
  }
  recent.push(now);
  requests.set(auth.payload.sub, recent);
  return { auth };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const body: unknown = await request.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
}

export function aiFailure(error: unknown, message: string) {
  console.error(message, error);
  const isUnconfigured = error instanceof Error && error.message === "AI service is not configured.";
  return NextResponse.json(
    { success: false, message: isUnconfigured ? "AI features are not configured." : message },
    { status: isUnconfigured ? 503 : 500 },
  );
}

export function stringArray(value: unknown, limit = 5): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, limit) : [];
}
