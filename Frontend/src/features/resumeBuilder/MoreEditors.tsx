import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type { ResumeCertification, ResumeLanguage } from "@/types/resume-builder";

export function CertificationsEditor({
  items,
  update,
  remove,
  move,
}: {
  items: ResumeCertification[];
  update: (id: string, patch: Partial<ResumeCertification>) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-gray-500">No certifications yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((c, i) => (
        <div key={c.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{c.name || "New certification"}</p>
            <div className="flex items-center gap-1">
              <ReorderButtons onUp={() => move(c.id, -1)} onDown={() => move(c.id, 1)} first={i === 0} last={i === items.length - 1} />
              <button type="button" onClick={() => remove(c.id)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputCls} value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
            </Field>
            <Field label="Issuer">
              <input className={inputCls} value={c.issuer} onChange={(e) => update(c.id, { issuer: e.target.value })} />
            </Field>
            <Field label="Date">
              <input type="month" className={inputCls} value={c.date} onChange={(e) => update(c.id, { date: e.target.value })} />
            </Field>
            <Field label="URL">
              <input className={inputCls} value={c.url} onChange={(e) => update(c.id, { url: e.target.value })} placeholder="https://" />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LanguagesEditor({
  items,
  update,
  remove,
  move,
}: {
  items: ResumeLanguage[];
  update: (id: string, patch: Partial<ResumeLanguage>) => void;
  remove: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-gray-500">No languages yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((l, i) => (
        <div key={l.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{l.name || "New language"}</p>
            <div className="flex items-center gap-1">
              <ReorderButtons onUp={() => move(l.id, -1)} onDown={() => move(l.id, 1)} first={i === 0} last={i === items.length - 1} />
              <button type="button" onClick={() => remove(l.id)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Language">
              <input className={inputCls} value={l.name} onChange={(e) => update(l.id, { name: e.target.value })} placeholder="English" />
            </Field>
            <Field label="Proficiency">
              <input className={inputCls} value={l.level} onChange={(e) => update(l.id, { level: e.target.value })} placeholder="Native / Fluent / B2…" />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReorderButtons({
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
      <button type="button" onClick={onUp} disabled={first} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDown} disabled={last} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </button>
    </>
  );
}
