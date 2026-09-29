"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { MoreIcon } from "./MobileIcons";
import { isRouteActive } from "./utils";
import type { DashboardConfig, MobileTabItem } from "./types";

/* ---------- Geometry (everything below is derived from these) ---------- */
const BAR_H = 62; // bar height (was 80)
const BTN = 42; // blue button diameter (was 52)
const RING = 5; // ring thickness (was 6)
const PROTRUDE = 10; // how far the ring rises above the bar (was 12)
const GAP = 5; // empty space between ring and notch edge (was 6)

const OUTER = BTN + RING * 2; // ring diameter
const CY = OUTER / 2 - PROTRUDE; // ring centre, measured from top of bar
const NOTCH_R = OUTER / 2 + GAP; // radius of the cutout
const SLOT_W = NOTCH_R * 2 + 8; // reserved gap between the two tab groups

const NOTCH_MASK = `radial-gradient(circle ${NOTCH_R}px at 50% ${CY}px, transparent ${NOTCH_R - 1}px, #000 ${NOTCH_R}px)`;

/* ---------- Shared styles ---------- */
const tabBase =
  "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10.5px] leading-none tracking-tight outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500/70";
const idle = "font-medium text-slate-500 dark:text-slate-400";
const activeText = "font-semibold text-blue-600 dark:text-blue-400";

function Dot({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500",
        show ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}
    />
  );
}

function NavItem({
  item,
  active,
}: {
  item: MobileTabItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(tabBase, active ? activeText : idle)}
    >
      <Icon active={active} />
      <span>{item.title}</span>
      <Dot show={active} />
    </Link>
  );
}

/* ---------- Component ---------- */
export function MobileBottomNav({ config }: { config: DashboardConfig }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { home, left, right } = config.mobile;

  const isActive = (item: MobileTabItem) =>
    isRouteActive(pathname, item.href, item.exact);
  const homeActive = isRouteActive(pathname, home.href, true);

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      <div
        className="pointer-events-auto relative mx-auto mb-[max(env(safe-area-inset-bottom),0.5rem)] w-[calc(100%-1.5rem)] max-w-md drop-shadow-[0_8px_18px_rgba(37,99,235,0.13)] dark:drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]"
        style={{ height: BAR_H }}
      >
        {/* Bar with circular notch */}
        <div
          className="flex h-full items-stretch rounded-[22px] border border-slate-900/[0.05] bg-white px-1 pt-1.5 dark:border-white/[0.08] dark:bg-[#111620]"
          style={{ WebkitMaskImage: NOTCH_MASK, maskImage: NOTCH_MASK }}
        >
          <div className="flex flex-1 items-center">
            {left.map((item) => (
              <NavItem key={item.href} item={item} active={isActive(item)} />
            ))}
          </div>

          <div className="shrink-0" style={{ width: SLOT_W }} aria-hidden />

          <div className="flex flex-1 items-center">
            {right.map((item) => (
              <NavItem key={item.href} item={item} active={isActive(item)} />
            ))}
            <button
              type="button"
              onClick={() => setOpenMobile(true)}
              aria-label="Open menu"
              className={cn(tabBase, idle)}
            >
              <MoreIcon />
              <span>More</span>
              <span aria-hidden className="size-1" />
            </button>
          </div>
        </div>

        {/* Home: ring + button + label + dot are ONE link */}
        <Link
          href={home.href}
          aria-current={homeActive ? "page" : undefined}
          className="group absolute left-1/2 flex -translate-x-1/2 flex-col items-center outline-none"
          style={{ top: -PROTRUDE }}
        >
          <span
            className="flex items-center justify-center rounded-full bg-white ring-1 ring-slate-900/[0.05] dark:bg-[#0b0f19] dark:ring-white/10"
            style={{ width: OUTER, height: OUTER }}
          >
            <span
              className="flex items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_4px_12px_-3px_rgba(37,99,235,0.55)] transition-transform group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-blue-400 dark:bg-gradient-to-b dark:from-blue-400 dark:to-blue-600 dark:shadow-[0_0_18px_rgba(37,99,235,0.45)]"
              style={{ width: BTN, height: BTN }}
            >
              <Home className="size-6" strokeWidth={2.2} />
            </span>
          </span>

          <span className="mt-1 text-[10.5px] font-semibold leading-none tracking-tight text-blue-600 dark:text-blue-400">
            {home.title}
          </span>
          <span className="mt-0.5">
            <Dot show={homeActive} />
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
