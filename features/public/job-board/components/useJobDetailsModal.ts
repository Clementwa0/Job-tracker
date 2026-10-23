"use client";

import { useCallback, useEffect, useState } from "react";

const PARAM = "job";

function readFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(PARAM);
}

export function useJobDetailsModal() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setSlug(readFromUrl());

    const onPopState = () => setSlug(readFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const open = useCallback((next: string) => {
    if (readFromUrl() === next) return;
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, next);
    window.history.pushState({ [PARAM]: next }, "", url);
    setSlug(next);
  }, []);

  const close = useCallback(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(PARAM)) return;
    url.searchParams.delete(PARAM);
    window.history.pushState({}, "", url);
    setSlug(null);
  }, []);

  return { slug, open, close };
}