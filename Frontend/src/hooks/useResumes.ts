import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY_RESUME,
  normalizeResume,
  uid,
  type ResumeData,
  type ResumeMeta,
} from "@/types/resume-builder";

const INDEX_KEY = "resumes-index.v1";
const ITEM_KEY = (id: string) => `resume.v1.${id}`;

/* ------------------------------------------------------------------ */
/*  Index                                                              */
/* ------------------------------------------------------------------ */

function readIndex(): ResumeMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(metas: ResumeMeta[]) {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(metas));
  } catch {
    /* quota */
  }
}

function readResume(id: string): ResumeData | null {
  try {
    const raw = window.localStorage.getItem(ITEM_KEY(id));
    if (!raw) return null;
    return normalizeResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeResume(data: ResumeData) {
  if (!data.meta?.id) return;
  try {
    window.localStorage.setItem(ITEM_KEY(data.meta.id), JSON.stringify(data));
  } catch {
    /* quota */
  }
}

/* ------------------------------------------------------------------ */
/*  Index-level hook (used by ResumesDashboard)                        */
/* ------------------------------------------------------------------ */

export function useResumesIndex() {
  const [items, setItems] = useState<ResumeMeta[]>(() => readIndex());

  const refresh = useCallback(() => setItems(readIndex()), []);

  const createBlank = useCallback((name?: string): ResumeMeta => {
    const meta: ResumeMeta = {
      id: uid(),
      name: name?.trim() || "Untitled resume",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const data: ResumeData = { ...EMPTY_RESUME, meta };
    writeResume(data);
    const next = [meta, ...readIndex()];
    writeIndex(next);
    setItems(next);
    return meta;
  }, []);

  const createFromData = useCallback((partial: Partial<ResumeData>, name?: string): ResumeMeta => {
    const meta: ResumeMeta = {
      id: uid(),
      name: name?.trim() || partial.contact?.fullName || "Imported resume",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const data = normalizeResume({ ...partial, meta });
    writeResume(data);
    const next = [meta, ...readIndex()];
    writeIndex(next);
    setItems(next);
    return meta;
  }, []);

  const duplicate = useCallback((id: string): ResumeMeta | null => {
    const src = readResume(id);
    if (!src) return null;
    const meta: ResumeMeta = {
      id: uid(),
      name: `${src.meta?.name || "Resume"} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    writeResume({ ...src, meta });
    const next = [meta, ...readIndex()];
    writeIndex(next);
    setItems(next);
    return meta;
  }, []);

  const rename = useCallback((id: string, name: string) => {
    const next = readIndex().map((m) => (m.id === id ? { ...m, name, updatedAt: Date.now() } : m));
    writeIndex(next);
    setItems(next);
    const data = readResume(id);
    if (data && data.meta) writeResume({ ...data, meta: { ...data.meta, name, updatedAt: Date.now() } });
  }, []);

  const remove = useCallback((id: string) => {
    const next = readIndex().filter((m) => m.id !== id);
    writeIndex(next);
    setItems(next);
    try {
      window.localStorage.removeItem(ITEM_KEY(id));
    } catch {
      /* ignore */
    }
  }, []);

  return { items, refresh, createBlank, createFromData, duplicate, rename, remove };
}

/* ------------------------------------------------------------------ */
/*  Editor hook with undo/redo                                         */
/* ------------------------------------------------------------------ */

const HISTORY_LIMIT = 50;

export function useResumeEditor(id: string | undefined) {
  const [data, _setData] = useState<ResumeData>(() => {
    if (!id) return EMPTY_RESUME;
    return readResume(id) || EMPTY_RESUME;
  });
  const past = useRef<ResumeData[]>([]);
  const future = useRef<ResumeData[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(Date.now());
  const [, force] = useState(0);

  // Re-load when id changes
  useEffect(() => {
    if (!id) return;
    const loaded = readResume(id) || EMPTY_RESUME;
    _setData(loaded);
    past.current = [];
    future.current = [];
    setSavedAt(Date.now());
  }, [id]);

  // Debounced autosave
  useEffect(() => {
    if (!data.meta?.id) return;
    const t = setTimeout(() => {
      const stamped: ResumeData = { ...data, meta: { ...data.meta!, updatedAt: Date.now() } };
      writeResume(stamped);
      // also bump index updatedAt
      const idx = readIndex().map((m) => (m.id === stamped.meta!.id ? { ...m, updatedAt: stamped.meta!.updatedAt } : m));
      writeIndex(idx);
      setSavedAt(Date.now());
    }, 400);
    return () => clearTimeout(t);
  }, [data]);

  const apply = useCallback((updater: (d: ResumeData) => ResumeData) => {
    _setData((prev) => {
      past.current.push(prev);
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
      future.current = [];
      force((n) => n + 1);
      return updater(prev);
    });
  }, []);

  const undo = useCallback(() => {
    _setData((prev) => {
      const last = past.current.pop();
      if (!last) return prev;
      future.current.push(prev);
      force((n) => n + 1);
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    _setData((prev) => {
      const next = future.current.pop();
      if (!next) return prev;
      past.current.push(prev);
      force((n) => n + 1);
      return next;
    });
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  const helpers = useMemo(
    () => ({
      patch<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
        apply((d) => ({ ...d, [key]: value }));
      },
      updateContact<K extends keyof ResumeData["contact"]>(k: K, v: ResumeData["contact"][K]) {
        apply((d) => ({ ...d, contact: { ...d.contact, [k]: v } }));
      },
      addItem<K extends "experience" | "education" | "projects" | "skills" | "certifications" | "languages">(
        key: K,
        item: ResumeData[K][number],
      ) {
        apply((d) => ({ ...d, [key]: [...(d[key] as unknown as Array<unknown>), item] } as ResumeData));
      },
      updateItem<K extends "experience" | "education" | "projects" | "skills" | "certifications" | "languages">(
        key: K,
        id: string,
        patch: Partial<ResumeData[K][number]>,
      ) {
        apply((d) => ({
          ...d,
          [key]: (d[key] as Array<{ id: string }>).map((x) => (x.id === id ? { ...x, ...patch } : x)),
        } as ResumeData));
      },
      removeItem<K extends "experience" | "education" | "projects" | "skills" | "certifications" | "languages">(
        key: K,
        id: string,
      ) {
        apply((d) => ({
          ...d,
          [key]: (d[key] as Array<{ id: string }>).filter((x) => x.id !== id),
        } as ResumeData));
      },
      moveItem<K extends "experience" | "education" | "projects" | "skills" | "certifications" | "languages">(
        key: K,
        id: string,
        direction: -1 | 1,
      ) {
        apply((d) => {
          const arr = [...(d[key] as Array<{ id: string }>)];
          const i = arr.findIndex((x) => x.id === id);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= arr.length) return d;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          return { ...d, [key]: arr } as ResumeData;
        });
      },
      replaceAll(next: Partial<ResumeData>) {
        apply((d) => normalizeResume({ ...next, meta: d.meta }));
      },
    }),
    [apply],
  );

  return { data, ...helpers, undo, redo, canUndo, canRedo, savedAt };
}
