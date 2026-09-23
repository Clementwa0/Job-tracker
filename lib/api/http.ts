import { NextResponse } from "next/server";

/** Standard error body: `{ success: false, message }`. */
export function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

/** Standard success body: `{ success: true, data }`. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Parses a JSON request body; null when it's missing or malformed. */
export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}
