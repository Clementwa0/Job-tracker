"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Role = { title: string; count: number; pct: number };

const RANK_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-slate-400",
];

const TopJobRolesCard = ({ roles }: { roles: Role[] }) => (
  <Card className="border-border p-4 shadow-none sm:p-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
        Top Job Roles
      </h2>
      <Link
        href="/jobseeker/applications"
        className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline sm:text-xs"
      >
        View All
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>

    {roles.length === 0 ? (
      <div className="rounded-lg border border-dashed border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">No applications yet</p>
      </div>
    ) : (
      <ul className="space-y-3">
        {roles.map((role, i) => (
          <li key={role.title} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                RANK_COLORS[i % RANK_COLORS.length]
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-foreground sm:text-sm">{role.title}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">{role.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", RANK_COLORS[i % RANK_COLORS.length])}
                  style={{ width: `${Math.max(role.pct, 4)}%` }}
                />
              </div>
            </div>
            <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground sm:text-[11px]">
              {role.pct}%
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

export default TopJobRolesCard;