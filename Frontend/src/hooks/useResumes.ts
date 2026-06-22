import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { resumeService } from "@/services/resumeService";
import {
  EMPTY_RESUME,
  normalizeResume,
  uid,
  type ResumeData,
  type ResumeMeta,
} from "@/types/resume-builder";

const INDEX_KEY = "resumes-index.v1";
const ITEM_KEY = (id: string) => `resume.v1.${id}`;

function readLocalIndex(): ResumeMeta[] {
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

function readLocalResume(id: string): ResumeData | null {
  try {
    const raw = window.localStorage.getItem(ITEM_KEY(id));
    if (!raw) return null;
    return normalizeResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clearLocalResumes() {
  const index = readLocalIndex();
  index.forEach((m) => {
    try {
      window.localStorage.removeItem(ITEM_KEY(m.id));
    } catch {
      /* ignore */
    }
  });
  try {
    window.localStorage.removeItem(INDEX_KEY);
  } catch {
    /* ignore */
  }
}

async function migrateLocalResumesToApi(): Promise<void> {
  const index = readLocalIndex();
  if (!index.length) return;

  for (const meta of index) {
    const data = readLocalResume(meta.id);
    if (!data) continue;
    await resumeService.create({
      ...data,
      meta: { ...meta, name: meta.name || "Imported resume" },
    });
  }
  clearLocalResumes();
}

/* ------------------------------------------------------------------ */
/*  Index-level hook (used by ResumesDashboard)                        */
/* ------------------------------------------------------------------ */

export function useResumesIndex() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<ResumeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const migrated = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (!migrated.current && readLocalIndex().length > 0) {
        await migrateLocalResumesToApi();
        migrated.current = true;
      }
      const list = await resumeService.list();
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const createBlank = useCallback(async (name?: string): Promise<ResumeMeta | null> => {
    const created = await resumeService.create({
      ...EMPTY_RESUME,
      meta: {
        id: uid(),
        name: name?.trim() || "Untitled resume",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    await refresh();
    return created.meta ?? null;
  }, [refresh]);

  const createFromData = useCallback(
    async (partial: Partial<ResumeData>, name?: string): Promise<ResumeMeta | null> => {
      const created = await resumeService.create(
        normalizeResume({
          ...partial,
          meta: {
            id: uid(),
            name: name?.trim() || partial.contact?.fullName || "Imported resume",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        }),
      );
      await refresh();
      return created.meta ?? null;
    },
    [refresh],
  );

  const duplicate = useCallback(
    async (id: string): Promise<ResumeMeta | null> => {
      const src = await resumeService.get(id);
      const created = await resumeService.create({
        ...src,
        meta: {
          id: uid(),
          name: `${src.meta?.name || "Resume"} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
      await refresh();
      return created.meta ?? null;
    },
    [refresh],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const current = await resumeService.get(id);
      await resumeService.update(id, {
        ...current,
        meta: { ...current.meta!, name, updatedAt: Date.now() },
      });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await resumeService.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { items, loading, refresh, createBlank, createFromData, duplicate, rename, remove };
}

/* ------------------------------------------------------------------ */
/*  Editor hook with undo/redo                                         */
/* ------------------------------------------------------------------ */

const HISTORY_LIMIT = 50;

export function useResumeEditor(id: string | undefined) {
  const { isAuthenticated } = useAuth();
  const [data, _setData] = useState<ResumeData>(EMPTY_RESUME);
  const [loading, setLoading] = useState(!!id);
  const past = useRef<ResumeData[]>([]);
  const future = useRef<ResumeData[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (!id || !isAuthenticated) {
      _setData(EMPTY_RESUME);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const loaded = await resumeService.get(id);
        if (!cancelled) {
          _setData(loaded);
          past.current = [];
          future.current = [];
          setSavedAt(Date.now());
        }
      } catch {
        if (!cancelled) _setData(EMPTY_RESUME);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!id || !data.meta?.id || loading) return;
    const t = setTimeout(() => {
      resumeService
        .update(id, { ...data, meta: { ...data.meta!, updatedAt: Date.now() } })
        .then(() => setSavedAt(Date.now()))
        .catch(() => {
          /* autosave failed silently; user can retry via navigation */
        });
    }, 600);
    return () => clearTimeout(t);
  }, [data, id, loading]);

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

  return { data, loading, ...helpers, undo, redo, canUndo, canRedo, savedAt };
}
