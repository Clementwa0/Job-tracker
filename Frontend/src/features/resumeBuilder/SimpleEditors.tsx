import { memo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type {
  ResumeEducation,
  ResumeProject,
  ResumeSkillsGroup,
} from "@/types/resume-builder";

/* ===================== Education ===================== */

export const EducationEditor = memo(function EducationEditor({
  items,
  update,
  remove,
}: {
  items: ResumeEducation[];
  update: (id: string, patch: Partial<ResumeEducation>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No education entries yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((ed) => (
        <EducationItem key={ed.id} item={ed} update={update} remove={remove} />
      ))}
    </div>
  );
});

const EducationItem = memo(function EducationItem({
  item,
  update,
  remove,
}: {
  item: ResumeEducation;
  update: (id: string, patch: Partial<ResumeEducation>) => void;
  remove: (id: string) => void;
}) {
  const onRemove = useCallback(() => remove(item.id), [item.id, remove]);
  return (
    <article className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <header className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {item.school || "New entry"}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Remove education"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="School">
          <input
            className={inputCls}
            value={item.school}
            onChange={(e) => update(item.id, { school: e.target.value })}
          />
        </Field>
        <Field label="Degree">
          <input
            className={inputCls}
            value={item.degree}
            onChange={(e) => update(item.id, { degree: e.target.value })}
          />
        </Field>
        <Field label="Field of study">
          <input
            className={inputCls}
            value={item.field}
            onChange={(e) => update(item.id, { field: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start">
            <input
              type="month"
              className={inputCls}
              value={item.startDate}
              onChange={(e) => update(item.id, { startDate: e.target.value })}
            />
          </Field>
          <Field label="End">
            <input
              type="month"
              className={inputCls}
              value={item.endDate}
              onChange={(e) => update(item.id, { endDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Notes" className="sm:col-span-2">
          <textarea
            rows={2}
            className={`${inputCls} resize-y`}
            value={item.notes}
            onChange={(e) => update(item.id, { notes: e.target.value })}
          />
        </Field>
      </div>
    </article>
  );
});

/* ===================== Projects ===================== */

export const ProjectsEditor = memo(function ProjectsEditor({
  items,
  update,
  remove,
}: {
  items: ResumeProject[];
  update: (id: string, patch: Partial<ResumeProject>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No projects yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <ProjectItem key={p.id} item={p} update={update} remove={remove} />
      ))}
    </div>
  );
});

const ProjectItem = memo(function ProjectItem({
  item,
  update,
  remove,
}: {
  item: ResumeProject;
  update: (id: string, patch: Partial<ResumeProject>) => void;
  remove: (id: string) => void;
}) {
  const setTech = useCallback(
    (raw: string) =>
      update(item.id, {
        tech: raw.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    [item.id, update],
  );
  return (
    <article className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <header className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {item.name || "New project"}
        </p>
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="rounded p-1 text-gray-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Remove project"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputCls}
            value={item.name}
            onChange={(e) => update(item.id, { name: e.target.value })}
          />
        </Field>
        <Field label="URL">
          <input
            className={inputCls}
            value={item.url}
            onChange={(e) => update(item.id, { url: e.target.value })}
            placeholder="https://"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            rows={2}
            className={`${inputCls} resize-y`}
            value={item.description}
            onChange={(e) => update(item.id, { description: e.target.value })}
          />
        </Field>
        <Field label="Tech (comma-separated)" className="sm:col-span-2">
          <input
            className={inputCls}
            value={item.tech.join(", ")}
            onChange={(e) => setTech(e.target.value)}
            placeholder="React, Node, Postgres"
          />
        </Field>
      </div>
    </article>
  );
});

/* ===================== Skills ===================== */

export const SkillsEditor = memo(function SkillsEditor({
  items,
  update,
  remove,
}: {
  items: ResumeSkillsGroup[];
  update: (id: string, patch: Partial<ResumeSkillsGroup>) => void;
  remove: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No skill groups yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((g) => (
        <SkillsItem key={g.id} item={g} update={update} remove={remove} />
      ))}
    </div>
  );
});

const SkillsItem = memo(function SkillsItem({
  item,
  update,
  remove,
}: {
  item: ResumeSkillsGroup;
  update: (id: string, patch: Partial<ResumeSkillsGroup>) => void;
  remove: (id: string) => void;
}) {
  const setItems = useCallback(
    (raw: string) =>
      update(item.id, {
        items: raw.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    [item.id, update],
  );
  return (
    <article className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <header className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {item.category || "New group"}
        </p>
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="rounded p-1 text-gray-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Remove skills group"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <input
            className={inputCls}
            value={item.category}
            onChange={(e) => update(item.id, { category: e.target.value })}
            placeholder="Languages"
          />
        </Field>
        <Field label="Items (comma-separated)">
          <input
            className={inputCls}
            value={item.items.join(", ")}
            onChange={(e) => setItems(e.target.value)}
            placeholder="TypeScript, Python, Go"
          />
        </Field>
      </div>
    </article>
  );
});