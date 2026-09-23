"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/features/jobseeker/settings/hooks/useProfile";

const VISIBLE_ITEMS = 2;

const ProfileCompletenessCard = () => {
  const { profile, isLoading } = useProfile();

  const { missing, doneCount, totalCount } = useMemo(() => {
    const items = profile?.completeness.items ?? [];
    const missing = items
      .filter((i) => !i.done)
      .sort((a, b) => b.weight - a.weight);
    return {
      missing,
      doneCount: items.length - missing.length,
      totalCount: items.length,
    };
  }, [profile]);

  // Hide entirely once we know the profile is complete.
  // Keep showing during loading so we don't flash layout shifts.
  if (!isLoading && totalCount > 0 && missing.length === 0) {
    return null;
  }

  const shown = missing.slice(0, VISIBLE_ITEMS);
  const rest = missing.length - shown.length;

  return (
    <Card className="border-border p-4 shadow-none">
      {/* Header — micro-label + counter */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
          Profile
        </span>
        <span className="text-xs font-medium tabular-nums text-foreground">
          {doneCount}
          <span className="text-muted-foreground/40">/{totalCount}</span>
        </span>
      </div>

      {/* Segmented progress — one tick per checklist item */}
      <div className="mt-3 flex gap-1" aria-hidden>
        {Array.from({ length: totalCount }).map((_, i) => (
          <span
            key={i}
            className={
              i < doneCount
                ? "h-0.5 flex-1 rounded-full bg-primary"
                : "h-0.5 flex-1 rounded-full bg-muted"
            }
          />
        ))}
      </div>

      {/* Next actions */}
      <ul className="mt-3.5 space-y-px">
        {isLoading ? (
          <>
            <li className="h-7 animate-pulse rounded bg-muted/40" />
            <li className="h-7 animate-pulse rounded bg-muted/40" />
          </>
        ) : (
          shown.map((item) => (
            <li key={item.key}>
              <Link
                href={`/jobseeker/settings#${item.key}`}
                className="group flex items-center justify-between rounded py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="truncate">{item.label}</span>
                <ArrowRight className="h-3 w-3 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ))
        )}
        {!isLoading && rest > 0 && (
          <li>
            <Link
              href="/jobseeker/settings"
              className="block py-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              +{rest} more
            </Link>
          </li>
        )}
      </ul>
    </Card>
  );
};

export default ProfileCompletenessCard;