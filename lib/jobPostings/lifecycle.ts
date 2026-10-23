import type { PostingStatus } from "@/types/employer";

export type EmployerPostingAction = "publish" | "unpublish" | "close";

/**
 * The only status changes an employer can make. Admin moderation
 * (approve / reject / reopen) lives in lib/admin/queries.ts and is separate.
 *
 *   draft ──publish──▶ published ──close──▶ closed ──publish──▶ published
 *     ▲                    │
 *     └────unpublish───────┘   (pending_review also unpublishes to draft)
 */
export const EMPLOYER_TRANSITIONS: Record<
  EmployerPostingAction,
  { from: readonly PostingStatus[]; to: PostingStatus }
> = {
  publish: { from: ["draft", "closed"], to: "published" },
  unpublish: { from: ["published", "pending_review"], to: "draft" },
  close: { from: ["published"], to: "closed" },
};

export function isEmployerPostingAction(value: string): value is EmployerPostingAction {
  return value in EMPLOYER_TRANSITIONS;
}

/** Content edits are blocked while an admin is reviewing the posting. */
export function canEditPosting(status: PostingStatus) {
  return status !== "pending_review";
}

/** Human-readable reason an action can't run from the current status. */
export function invalidTransitionMessage(action: EmployerPostingAction, status: PostingStatus) {
  const label = status.replace("_", " ");
  switch (action) {
    case "publish":
      return status === "published"
        ? "This posting is already published."
        : `A posting that is ${label} can't be published. Unpublish it first.`;
    case "unpublish":
      return `Only published or pending postings can be unpublished (this one is ${label}).`;
    case "close":
      return `Only published postings can be closed (this one is ${label}).`;
  }
}
