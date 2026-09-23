"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Role = { title: string; count: number; pct: number };

type Props = {
  roles: Role[];
};

const RANK_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-slate-400",
];

const TopJobRolesCard = ({ roles }: Props) => {
  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Top Job Roles
        </h2>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {roles.map((role, i) => (
            <li key={role.title} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                  RANK_COLORS[i % RANK_COLORS.length]
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{role.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{role.count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", RANK_COLORS[i % RANK_COLORS.length])}
                    style={{ width: `${Math.max(role.pct, 4)}%` }}
                  />
                </div>
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] text-muted-foreground">
                {role.pct}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TopJobRolesCard;
