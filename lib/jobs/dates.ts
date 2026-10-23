/**
 * Tolerant date helpers. Application and interview dates come from user input
 * and older rows, so any of them can be empty or unparseable; `new Date(x)
 * .getTime()` then yields NaN, which silently breaks `sort` comparators.
 */

/** Epoch ms for a date-ish value, or null when it is missing or invalid. */
export function toTime(value?: string | number | Date | null): number | null {
  if (value === undefined || value === null || value === "") return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/** `toTime`, with a fallback (default 0) so it is always safe to subtract. */
export function timeOr(value: string | number | Date | null | undefined, fallback = 0): number {
  return toTime(value) ?? fallback;
}

/**
 * Comparator for newest-first / oldest-first sorting that always puts
 * missing or invalid dates last, in either direction.
 */
export function compareByDate<T>(
  get: (item: T) => string | number | Date | null | undefined,
  direction: "asc" | "desc" = "desc",
) {
  return (a: T, b: T): number => {
    const ta = toTime(get(a));
    const tb = toTime(get(b));
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return direction === "asc" ? ta - tb : tb - ta;
  };
}
