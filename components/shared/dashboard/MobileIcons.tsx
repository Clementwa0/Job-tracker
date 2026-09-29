"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type TabIconProps = { active: boolean };
export type TabIcon = ComponentType<TabIconProps>;

/**
 * Turns any lucide icon into a mobile-tab icon: outlined when idle,
 * lightly filled + heavier stroke when active. Colour comes from the tab's text colour.
 */
export function lucideTab(Icon: LucideIcon): TabIcon {
  function LucideTabIcon({ active }: TabIconProps) {
    return (
      <Icon
        className="size-5"
        strokeWidth={active ? 2.2 : 1.8}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.16 : 0}
        aria-hidden="true"
      />
    );
  }
  return LucideTabIcon;
}

/* ---------- Icons (outlined idle, filled active) ---------- */
const FILL = "fill-blue-600 dark:fill-blue-500";

export function ClipboardListIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-5">
      <rect x="6.75" y="4.5" width="10.5" height="17.25" rx="2.25" className={FILL} />
      <path d="M9.75 2.75h4.5v3h-4.5z" className={FILL} />
      <path d="M9.75 11.25h4.5M9.75 15h4.5M9.75 18h2.25" fill="none" stroke="white" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <rect x="6.75" y="4.5" width="10.5" height="17.25" rx="2.25" />
      <path d="M9.75 2.25h4.5v3h-4.5z" />
      <path d="M9.75 11.25h4.5M9.75 15h4.5M9.75 18h2.25" />
    </svg>
  );
}
export function BarChartIcon({ active }: { active: boolean }) {
  const bar = active
    ? { className: FILL, stroke: "none", strokeWidth: 0 }
    : { className: "fill-none", stroke: "currentColor", strokeWidth: 1.8 };
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <rect x="3" y="12" width="3.5" height="9" rx="1" {...bar} />
      <rect x="10.25" y="6" width="3.5" height="15" rx="1" {...bar} />
      <rect x="17.5" y="9" width="3.5" height="12" rx="1" {...bar} />
    </svg>
  );
}

export function CalendarIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-5">
      <path d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3a.75.75 0 0 1 1.5 0v1.5h.75A2.25 2.25 0 0 1 21 6.75v12A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75v-12A2.25 2.25 0 0 1 5.25 4.5h.75V3a.75.75 0 0 1 .75-.75Z" className={FILL} />
      <circle cx="9" cy="13.5" r="1.35" fill="white" />
      <circle cx="15" cy="13.5" r="1.35" fill="white" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.25" />
      <path d="M7.5 2.25V6M16.5 2.25V6M3 10.5h18" />
      <circle cx="9" cy="14.25" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14.25" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <span className="grid size-5 grid-cols-2 place-items-center gap-[3px]">
      <span className="size-[5px] rounded-full border-[1.5px] border-current" />
      <span className="size-[5px] rounded-full border-[1.5px] border-current" />
      <span className="size-[5px] rounded-full border-[1.5px] border-current" />
      <span className="size-[5px] rounded-full bg-blue-600 dark:bg-blue-500" />
    </span>
  );
}
