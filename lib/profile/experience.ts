/**
 * Derives "years of experience" from the free-form date strings the resume
 * builder stores ("2021-03", "Mar 2021", "03/2021", "2021"). Pure.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const utc = (year: number, month: number) => new Date(Date.UTC(year, month, 1));

/**
 * `edge` matters only for bare years: a start of "2021" means January, an
 * end of "2021" means December.
 */
export function parseLooseDate(input: unknown, edge: "start" | "end" = "start"): Date | null {
  if (typeof input !== "string") return null;
  const s = input.trim().toLowerCase();
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m) return validMonth(+m[1], +m[2] - 1);

  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return validMonth(+m[2], +m[1] - 1);

  m = s.match(/^([a-z]{3,9})\.?,?\s+(\d{4})$/);
  if (m) {
    const idx = MONTHS.indexOf(m[1].slice(0, 3));
    return idx >= 0 ? validMonth(+m[2], idx) : null;
  }

  m = s.match(/^(\d{4})$/);
  if (m) return validMonth(+m[1], edge === "start" ? 0 : 11);

  return null;
}

function validMonth(year: number, month: number): Date | null {
  if (year < 1950 || year > 2100 || month < 0 || month > 11) return null;
  return utc(year, month);
}

export interface ExperienceSpan {
  startDate?: unknown;
  endDate?: unknown;
  current?: unknown;
}

/**
 * Total time covered by the given roles, with overlapping roles counted once,
 * in years to one decimal. Returns null when no role has a usable start date
 * (so callers can tell "unknown" from "zero").
 *
 * A role with no usable end date only counts if it's marked current.
 */
export function yearsOfExperience(spans: ExperienceSpan[], now: Date = new Date()): number | null {
  const intervals: Array<[number, number]> = [];

  for (const span of spans) {
    const start = parseLooseDate(span.startDate, "start");
    if (!start) continue;
    const end =
      span.current === true ? now : parseLooseDate(span.endDate, "end") ?? null;
    if (!end) continue;
    const a = start.getTime();
    const b = Math.min(end.getTime(), now.getTime());
    if (b > a) intervals.push([a, b]);
  }

  if (intervals.length === 0) {
    return spans.some((s) => parseLooseDate(s.startDate, "start")) ? 0 : null;
  }

  intervals.sort((x, y) => x[0] - y[0]);
  let total = 0;
  let [curStart, curEnd] = intervals[0];
  for (const [a, b] of intervals.slice(1)) {
    if (a <= curEnd) curEnd = Math.max(curEnd, b);
    else {
      total += curEnd - curStart;
      [curStart, curEnd] = [a, b];
    }
  }
  total += curEnd - curStart;

  const years = total / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years * 10) / 10;
}
