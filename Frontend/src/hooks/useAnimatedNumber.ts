import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens a number toward `target`. Cheap rAF loop, single state
 * subscription, automatically respects `prefers-reduced-motion`.
 */
export function useAnimatedNumber(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }

    fromRef.current = value;
    startRef.current = null;

    const tick = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(t === 1 ? target : next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally only re-run when `target` changes — `value` is the
    // animation cursor and would create a feedback loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}