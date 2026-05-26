import { memo } from "react";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type {
  ResumeCertification,
  ResumeLanguage,
} from "@/types/resume-builder";

/* ------------------------------------------------------------------ *
 * Generic reorder buttons — shared by both editors below.             *
 * ------------------------------------------------------------------ */

export const ReorderButtons = memo(function ReorderButtons({
  onUp,
  onDown,
  first,
  last,
}: {
  onUp: () => void;
  onDown: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onUp}
        disabled={first}
        className="rounded p-1 text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30"
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={last}
        className="rounded p-1 text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30"
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" aria-hidden />
      </button>
    </>
  );
});

/* ===================== Certifications ===================== */

interface CertProps {
  items: ResumeCertification[];
  update: (id: string, patch: Partial<ResumeCertification>) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
}

export const CertificationsEditor = memo(function CertificationsEditor({
  items,
  update,
  remove,
  move,
}: CertProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No certifications yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((c, i) => (
        <article
          key={c.id}
          className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <header className="mb-3 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {c.name || "New certification"}
            </p>
            <div className="flex items-center gap-1">
              <ReorderButtons
                onUp={() => move(c.id, -1)}
                onDown={() => move(c.id, 1)}
                first={i === 0}
                last={i === items.length - 1}
              />
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="rounded p-1 text-gray-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Remove certification"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={inputCls}
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Issuer">
              <input
                className={inputCls}
                value={c.issuer}
                onChange={(e) => update(c.id, { issuer: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <input
                type="month"
                className={inputCls}
                value={c.date}
                onChange={(e) => update(c.id, { date: e.target.value })}
              />
            </Field>
            <Field label="URL">
              <input
                className={inputCls}
                value={c.url}
                onChange={(e) => update(c.id, { url: e.target.value })}
                placeholder="https://"
              />
            </Field>
          </div>
        </article>
      ))}
    </div>
  );
});

/* ===================== Languages ===================== */

interface LangProps {
  items: ResumeLanguage[];
  update: (id: string, patch: Partial<ResumeLanguage>) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
}

export const LanguagesEditor = memo(function LanguagesEditor({
  items,
  update,
  remove,
  move,
}: LangProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No languages yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((l, i) => (
        <article
          key={l.id}
          className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <header className="mb-3 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {l.name || "New language"}
            </p>
            <div className="flex items-center gap-1">
              <ReorderButtons
                onUp={() => move(l.id, -1)}
                onDown={() => move(l.id, 1)}
                first={i === 0}
                last={i === items.length - 1}
              />
              <button
                type="button"
                onClick={() => remove(l.id)}
                className="rounded p-1 text-gray-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Remove language"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Language">
              <input
                className={inputCls}
                value={l.name}
                onChange={(e) => update(l.id, { name: e.target.value })}
                placeholder="English"
              />
            </Field>
            <Field label="Proficiency">
              <input
                className={inputCls}
                value={l.level}
                onChange={(e) => update(l.id, { level: e.target.value })}
                placeholder="Native / Fluent / B2…"
              />
            </Field>
          </div>
        </article>
      ))}
    </div>
  );
});