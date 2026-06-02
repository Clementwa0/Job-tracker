import { Trash2, ArrowUp, ArrowDown, Award, Languages, GripVertical } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type { ResumeCertification, ResumeLanguage } from "@/types/resume-builder";

// Enhanced input class with better mobile touch targets
const enhancedInputCls = `${inputCls} min-h-[44px] text-base sm:text-sm`;

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
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No certifications added yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Click the button above to add your first certification
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((c, i) => (
        <div
          key={c.id}
          className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 sm:p-5"
        >
          {/* Header with drag indicator for desktop */}
          <div className="mb-4 flex items-start gap-3">
            <div className="hidden sm:flex items-center mt-1 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors cursor-grab">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 truncate dark:text-gray-100">
                {c.name || "New Certification"}
              </h3>
              {c.issuer && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {c.issuer}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <ReorderButtons
                onUp={() => move(c.id, -1)}
                onDown={() => move(c.id, 1)}
                first={i === 0}
                last={i === items.length - 1}
              />
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                aria-label="Remove certification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Certification Name">
                <input
                  className={enhancedInputCls}
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                  placeholder="e.g., AWS Solutions Architect"
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field label="Issuing Organization">
              <input
                className={enhancedInputCls}
                value={c.issuer}
                onChange={(e) => update(c.id, { issuer: e.target.value })}
                placeholder="e.g., Amazon Web Services"
                autoComplete="off"
              />
            </Field>
            <Field label="Date Earned">
              <input
                type="month"
                className={enhancedInputCls}
                value={c.date}
                onChange={(e) => update(c.id, { date: e.target.value })}
              />
            </Field>
            <Field label="Credential URL">
              <input
                className={enhancedInputCls}
                value={c.url}
                onChange={(e) => update(c.id, { url: e.target.value })}
                placeholder="https://"
                type="url"
                autoComplete="off"
              />
            </Field>
          </div>
          
          {/* Mobile reorder indicator */}
          <div className="mt-3 flex justify-between sm:hidden">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Position: {i + 1} of {items.length}
            </span>
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
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Languages className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No languages added yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Click the button above to add a language
        </p>
      </div>
    );
  }

  const getProficiencyColor = (level: string) => {
    const normalized = level.toLowerCase();
    if (normalized.includes("native") || normalized.includes("c2")) return "bg-green-500";
    if (normalized.includes("fluent") || normalized.includes("c1")) return "bg-blue-500";
    if (normalized.includes("advanced") || normalized.includes("b2")) return "bg-purple-500";
    if (normalized.includes("intermediate") || normalized.includes("b1")) return "bg-yellow-500";
    if (normalized.includes("basic") || normalized.includes("a1") || normalized.includes("a2")) return "bg-orange-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((l, i) => (
        <div
          key={l.id}
          className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 sm:p-5"
        >
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="hidden sm:flex items-center mt-1 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors cursor-grab">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800 truncate dark:text-gray-100">
                  {l.name || "New Language"}
                </h3>
                {l.level && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${getProficiencyColor(l.level)}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {l.level}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <ReorderButtons
                onUp={() => move(l.id, -1)}
                onDown={() => move(l.id, 1)}
                first={i === 0}
                last={i === items.length - 1}
              />
              <button
                type="button"
                onClick={() => remove(l.id)}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                aria-label="Remove language"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Language">
              <input
                className={enhancedInputCls}
                value={l.name}
                onChange={(e) => update(l.id, { name: e.target.value })}
                placeholder="e.g., English"
                autoComplete="off"
              />
            </Field>
            <Field label="Proficiency Level">
              <select
                className={`${enhancedInputCls} cursor-pointer`}
                value={l.level}
                onChange={(e) => update(l.id, { level: e.target.value })}
              >
                <option value="">Select level...</option>
                <optgroup label="CEFR Levels">
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                </optgroup>
                <optgroup label="Common Terms">
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </optgroup>
              </select>
            </Field>
          </div>
          
          {/* Mobile position indicator */}
          <div className="mt-3 flex justify-between sm:hidden">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Position: {i + 1} of {items.length}
            </span>
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
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onUp}
        disabled={first}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={last}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}