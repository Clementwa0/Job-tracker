import { Trash2 } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type { ResumeEducation, ResumeProject, ResumeSkillsGroup } from "@/types/resume-builder";

export function EducationEditor({
  items,
  update,
  remove,
}: {
  items: ResumeEducation[];
  update: (id: string, patch: Partial<ResumeEducation>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-gray-500">No education entries yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((ed) => (
        <div key={ed.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {ed.school || "New entry"}
            </p>
            <button
              type="button"
              onClick={() => remove(ed.id)}
              className="rounded p-1 text-gray-400 hover:text-rose-500"
              aria-label="Remove education"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="School">
              <input className={inputCls} value={ed.school} onChange={(e) => update(ed.id, { school: e.target.value })} />
            </Field>
            <Field label="Degree">
              <input className={inputCls} value={ed.degree} onChange={(e) => update(ed.id, { degree: e.target.value })} />
            </Field>
            <Field label="Field of study">
              <input className={inputCls} value={ed.field} onChange={(e) => update(ed.id, { field: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start">
                <input type="month" className={inputCls} value={ed.startDate} onChange={(e) => update(ed.id, { startDate: e.target.value })} />
              </Field>
              <Field label="End">
                <input type="month" className={inputCls} value={ed.endDate} onChange={(e) => update(ed.id, { endDate: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes" className="sm:col-span-2">
              <textarea rows={2} className={inputCls + " resize-y"} value={ed.notes} onChange={(e) => update(ed.id, { notes: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsEditor({
  items,
  update,
  remove,
}: {
  items: ResumeProject[];
  update: (id: string, patch: Partial<ResumeProject>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-gray-500">No projects yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{p.name || "New project"}</p>
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="rounded p-1 text-gray-400 hover:text-rose-500"
              aria-label="Remove project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputCls} value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} />
            </Field>
            <Field label="URL">
              <input className={inputCls} value={p.url} onChange={(e) => update(p.id, { url: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea rows={2} className={inputCls + " resize-y"} value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} />
            </Field>
            <Field label="Tech (comma-separated)" className="sm:col-span-2">
              <input
                className={inputCls}
                value={p.tech.join(", ")}
                onChange={(e) =>
                  update(p.id, { tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="React, Node, Postgres"
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillsEditor({
  items,
  update,
  remove,
}: {
  items: ResumeSkillsGroup[];
  update: (id: string, patch: Partial<ResumeSkillsGroup>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) return <p className="text-sm text-gray-500">No skill groups yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((g) => (
        <div key={g.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{g.category || "New group"}</p>
            <button
              type="button"
              onClick={() => remove(g.id)}
              className="rounded p-1 text-gray-400 hover:text-rose-500"
              aria-label="Remove skills group"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category">
              <input className={inputCls} value={g.category} onChange={(e) => update(g.id, { category: e.target.value })} placeholder="Languages" />
            </Field>
            <Field label="Items (comma-separated)">
              <input
                className={inputCls}
                value={g.items.join(", ")}
                onChange={(e) =>
                  update(g.id, { items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="TypeScript, Python, Go"
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}
