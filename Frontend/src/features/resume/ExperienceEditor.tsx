import { useState } from "react";
import { Trash2, Sparkles, Plus, X, Loader2, Building2, Calendar, MapPin, Briefcase, GripVertical } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type { ResumeExperience } from "@/types/resume-builder";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

interface Props {
  items: ResumeExperience[];
  update: (id: string, patch: Partial<ResumeExperience>) => void;
  remove: (id: string) => void;
}

// Enhanced input class with better mobile touch targets
const enhancedInputCls = `${inputCls} min-h-[44px] text-base sm:text-sm`;

export default function ExperienceEditor({ items, update, remove }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
          <Briefcase className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          No experience added yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          Start building your professional story by adding your work experience, internships, or volunteer roles.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-5">
      {items.map((x) => (
        <ExperienceItem key={x.id} item={x} update={update} remove={remove} />
      ))}
    </div>
  );
}

function ExperienceItem({
  item,
  update,
  remove,
}: {
  item: ResumeExperience;
  update: (id: string, patch: Partial<ResumeExperience>) => void;
  remove: (id: string) => void;
}) {
  const setBullet = (i: number, v: string) => {
    const next = [...item.bullets];
    next[i] = v;
    update(item.id, { bullets: next });
  };
  const addBullet = () => update(item.id, { bullets: [...item.bullets, ""] });
  const removeBullet = (i: number) =>
    update(item.id, { bullets: item.bullets.filter((_, idx) => idx !== i) });

  // Calculate duration for display
  const getDuration = () => {
    if (!item.startDate) return "";
    const start = new Date(item.startDate);
    const end = item.current ? new Date() : item.endDate ? new Date(item.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0 && remainingMonths === 0) return "";
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (remainingMonths > 0) parts.push(`${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`);
    return `(${parts.join(' ')})`;
  };

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="hidden sm:flex items-center mt-1 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors cursor-grab">
          <GripVertical className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {item.role || "New Position"}
            </h3>
            {item.company && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">·</span>
                <Building2 className="h-3 w-3 sm:hidden" />
                <span className="truncate">{item.company}</span>
              </div>
            )}
          </div>
          
          {/* Meta information */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {(item.startDate || item.endDate || item.current) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  {item.startDate ? new Date(item.startDate + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "?"}
                  {" — "}
                  {item.current ? "Present" : item.endDate ? new Date(item.endDate + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "?"}
                </span>
                {getDuration() && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">{getDuration()}</span>
                )}
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors flex-shrink-0"
          aria-label="Remove experience"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Form fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Job Title">
            <input
              className={enhancedInputCls}
              value={item.role}
              onChange={(e) => update(item.id, { role: e.target.value })}
              placeholder="Senior Software Engineer"
              autoComplete="off"
            />
          </Field>
        </div>
        <Field label="Company">
          <input
            className={enhancedInputCls}
            value={item.company}
            onChange={(e) => update(item.id, { company: e.target.value })}
            placeholder="Acme Inc."
            autoComplete="off"
          />
        </Field>
        <Field label="Location">
          <input
            className={enhancedInputCls}
            value={item.location}
            onChange={(e) => update(item.id, { location: e.target.value })}
            placeholder="Remote · New York, NY"
            autoComplete="off"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date">
            <input
              type="month"
              className={enhancedInputCls}
              value={item.startDate}
              onChange={(e) => update(item.id, { startDate: e.target.value })}
            />
          </Field>
          <Field label="End Date">
            <input
              type="month"
              className={enhancedInputCls}
              value={item.endDate}
              disabled={item.current}
              onChange={(e) => update(item.id, { endDate: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Current position toggle */}
      <label className="mt-4 inline-flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer group/toggle">
        <div className="relative">
          <input
            type="checkbox"
            checked={item.current}
            onChange={(e) => update(item.id, { current: e.target.checked, endDate: e.target.checked ? "" : item.endDate })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors dark:bg-gray-700" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="group-hover/toggle:text-gray-900 dark:group-hover/toggle:text-gray-200 transition-colors">
          I currently work here
        </span>
      </label>

      {/* Bullets Section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Key Achievements
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({item.bullets.length})
            </span>
          </div>
          <button
            type="button"
            onClick={addBullet}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Achievement
          </button>
        </div>
        
        {item.bullets.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add quantifiable achievements to make your experience stand out
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {item.bullets.map((b, i) => (
              <BulletRow
                key={i}
                index={i}
                value={b}
                onChange={(v) => setBullet(i, v)}
                onRemove={() => removeBullet(i)}
                context={`${item.role} at ${item.company}`}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BulletRow({
  value,
  onChange,
  onRemove,
  context,
  index,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  context: string;
  index: number;
}) {
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const rewrite = async () => {
    if (!value.trim()) {
      toast.error("Please enter an achievement to improve.");
      return;
    }
    setBusy(true);
    setVariants([]);
    try {
      const result = await aiService.rewriteBullet(value, context);
      setVariants(result.variants ?? []);
      if (!result.variants?.length) {
        toast.error("No suggestions available. Please try again later.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to get suggestions. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const dismissVariants = () => setVariants([]);

  return (
    <li className="relative">
      <div className={`flex items-start gap-2 p-2 -mx-2 rounded-lg transition-colors ${isFocused ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
        <span className="mt-3 text-gray-300 dark:text-gray-600 select-none flex-shrink-0">
          {index + 1}.
        </span>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Increased revenue by 25% through implementation of new payment system"
          className={`${enhancedInputCls} resize-y flex-1`}
        />
        <div className="flex items-center gap-1 mt-1 flex-shrink-0">
          <button
            type="button"
            onClick={rewrite}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-colors"
            title="Improve with AI"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Improve</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            aria-label="Remove achievement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* AI Suggestions Panel */}
      {variants.length > 0 && (
        <div className="ml-7 mt-2 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-blue-100/50 dark:bg-blue-900/20">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              AI Suggestions
            </p>
            <button
              type="button"
              onClick={dismissVariants}
              className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {variants.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(v);
                  dismissVariants();
                }}
                className="group/suggestion block w-full text-left text-sm rounded-lg px-3 py-2.5 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 group-hover/suggestion:text-blue-600 transition-colors mt-0.5">
                    {i + 1}.
                  </span>
                  <span>{v}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}