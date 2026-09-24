const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True for a canonical hyphenated UUID. Use before putting any
 * client-supplied id (route params, JWT `sub`, query strings) into a query
 * against a `uuid` column - Postgres throws on malformed input rather than
 * simply matching nothing.
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
