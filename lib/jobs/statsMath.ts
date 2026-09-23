/** Pure helpers for the dashboard's "last 7 days vs previous 7 days" stats. */

export const WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface StatsWindows {
  /** Exclusive upper bound of both windows. */
  end: Date;
  /** Current window is [currentStart, end). */
  currentStart: Date;
  /** Previous window is [previousStart, currentStart). */
  previousStart: Date;
}

/**
 * Two adjacent, equal-length, non-overlapping rolling windows ending "now":
 * the last `days` days, and the `days` days immediately before that.
 */
export function statsWindows(now: Date, days: number = WINDOW_DAYS): StatsWindows {
  const span = days * DAY_MS;
  return {
    end: now,
    currentStart: new Date(now.getTime() - span),
    previousStart: new Date(now.getTime() - 2 * span),
  };
}

/**
 * Percentage change from `previous` to `current`, rounded to a whole number.
 * Returns null when there is no baseline (previous = 0): a jump from 0 to 3
 * isn't "+100%" or any other meaningful percentage, so the UI shows no trend.
 */
export function trendPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Share of applications that got a real response, as a % with one decimal. */
export function responseRatePercent(responded: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((responded / total) * 1000) / 10;
}
