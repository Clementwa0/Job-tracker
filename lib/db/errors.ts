/** SQLSTATE codes we handle explicitly. */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";
export const PG_INVALID_TEXT_REPRESENTATION = "22P02";

/**
 * Extracts the Postgres SQLSTATE from a thrown error. Drizzle wraps driver
 * errors (the original is on `.cause`), so walk a few levels down.
 */
export function pgErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
