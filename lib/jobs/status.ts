/**
 * Application-status rules shared by the API (validation, stats, history) and
 * the UI. Dependency-free so both sides import the same definition.
 */
import {
  APPLICATION_STATUSES,
  type ApplicationStatusValue,
} from "@/lib/db/schema/application-status";

export { APPLICATION_STATUSES };
export type { ApplicationStatusValue };

/**
 * Statuses that mean an employer actually got back to the candidate.
 * "applied" and "waiting_response" are the candidate's own state, and
 * "ghosted" means no reply at all, so none of those count as a response.
 */
export const RESPONSE_STATUSES = ["interviewing", "offer", "rejected"] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

/** Statuses where the application is still moving (no final outcome yet). */
export const OPEN_STATUSES = ["applied", "waiting_response", "interviewing"] as const;

/** Statuses from which scheduling an interview moves the application to "interviewing". */
export const PRE_INTERVIEW_STATUSES = ["applied", "waiting_response"] as const;

const LABELS: Record<ApplicationStatusValue, string> = {
  applied: "Applied",
  waiting_response: "Waiting response",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  completed: "Completed",
};

export function statusLabel(status: string): string {
  return LABELS[status as ApplicationStatusValue] ?? status;
}

/**
 * Lowercases and snake_cases a status ("Waiting Response" → "waiting_response")
 * so cosmetic differences never create a second spelling of the same status.
 */
export function normalizeStatus(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : "";
}

export function isApplicationStatus(value: unknown): value is ApplicationStatusValue {
  return (APPLICATION_STATUSES as readonly string[]).includes(value as string);
}

export function isResponseStatus(value: unknown): value is ResponseStatus {
  return (RESPONSE_STATUSES as readonly string[]).includes(normalizeStatus(value));
}

export interface StatusTimestamps {
  respondedAt: Date | null;
  offerAt: Date | null;
}

/**
 * Works out `responded_at` / `offer_at` after a job's status is set to
 * `nextStatus`. `prev` is the stored state before the change (null on create).
 *
 * These are *history* markers: each is stamped the first time the job reaches
 * the relevant state and then never cleared or moved. A later status change
 * (offer → completed, interviewing → ghosted…) doesn't erase the fact that
 * the employer responded or made an offer, so response/offer analytics stay
 * accurate over time.
 */
export function deriveStatusTimestamps(
  prev: { respondedAt: Date | null; offerAt: Date | null } | null,
  nextStatus: string,
  now: Date,
): StatusTimestamps {
  const next = normalizeStatus(nextStatus);
  return {
    respondedAt: prev?.respondedAt ?? (isResponseStatus(next) ? now : null),
    offerAt: prev?.offerAt ?? (next === "offer" ? now : null),
  };
}
