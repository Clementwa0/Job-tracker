import { cookies } from "next/headers";
import { REFRESH_TOKEN_TTL_MS } from "@/lib/auth/jwt";

export const REFRESH_COOKIE_NAME = "jtrail_refresh_token";

export async function setRefreshCookie(token: string) {
  const store = await cookies();
  store.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
  });
}

export async function getRefreshCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE_NAME)?.value;
}

export async function clearRefreshCookie() {
  const store = await cookies();
  store.delete(REFRESH_COOKIE_NAME);
}
