"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeResume, uid, type ResumeData } from "./types";

const KEY = "jobtrail.resumes.v1";

function read(): ResumeData[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    return Array.isArray(list) ? list.map((r) => normalizeResume(r as never)).filter((r) => r.meta?.id) : [];
  } catch {
    return [];
  }
}
function write(list: ResumeData[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("resumes-changed"));
}

export function useResumes() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setResumes(read());
    sync();
    setReady(true);
    window.addEventListener("resumes-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("resumes-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const create = useCallback((base: ResumeData, name: string) => {
    const now = Date.now();
    const r = normalizeResume({ ...base, meta: { id: uid(), name, createdAt: now, updatedAt: now } });
    write([r, ...read()]);
    return r.meta!.id;
  }, []);
  const save = useCallback((r: ResumeData) => {
    const next = { ...r, meta: { ...r.meta!, updatedAt: Date.now() } };
    write(read().map((x) => (x.meta?.id === next.meta.id ? next : x)));
  }, []);
  const remove = useCallback((id: string) => write(read().filter((x) => x.meta?.id !== id)), []);
  const duplicate = useCallback((id: string) => {
    const src = read().find((x) => x.meta?.id === id);
    if (src) create(src, `${src.meta?.name} (copy)`);
  }, [create]);

  return { resumes, ready, create, save, remove, duplicate };
}
