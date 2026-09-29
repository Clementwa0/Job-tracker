"use client";

import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_MODES,
} from "@/lib/jobPostings/options";
import { cn } from "@/lib/utils";

export interface JobBoardFilterValue {
  location: string;
  category: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
}

export const EMPTY_FILTERS: JobBoardFilterValue = {
  location: "",
  category: "all",
  jobType: "all",
  workMode: "all",
  experienceLevel: "all",
};

const labelOf = (options: readonly (readonly [string, string])[], value: string) =>
  options.find(([key]) => key === value)?.[1] ?? value;

/** Active filters as removable chips (used by the page toolbar). */
export function getActiveFilterChips(value: JobBoardFilterValue) {
  const chips: { key: keyof JobBoardFilterValue; label: string }[] = [];
  if (value.location.trim()) chips.push({ key: "location", label: value.location.trim() });
  if (value.category !== "all") chips.push({ key: "category", label: value.category });
  if (value.jobType !== "all") chips.push({ key: "jobType", label: labelOf(JOB_TYPES, value.jobType) });
  if (value.workMode !== "all") chips.push({ key: "workMode", label: labelOf(WORK_MODES, value.workMode) });
  if (value.experienceLevel !== "all") chips.push({ key: "experienceLevel", label: value.experienceLevel });
  return chips;
}

interface JobBoardFiltersProps {
  value: JobBoardFilterValue;
  onChange: (patch: Partial<JobBoardFilterValue>) => void;
  onClear: () => void;
  /** "sidebar" (default) is sticky on desktop; "sheet" renders bare for the mobile sheet. */
  variant?: "sidebar" | "sheet";
}

export default function JobBoardFilters({
  value,
  onChange,
  onClear,
  variant = "sidebar",
}: JobBoardFiltersProps) {
  const hasActive = getActiveFilterChips(value).length > 0;

  return (
    <div
      className={cn(
        "space-y-4",
        variant === "sidebar" && "sticky top-20 h-fit",
      )}
    >
      {variant === "sidebar" && (
        <div className="flex h-6 items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
          {hasActive && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <Field label="Location">
        <Input
          value={value.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="City or country"
          className="h-8 px-2.5 text-[13px] md:text-[13px]"
        />
      </Field>

      <Field label="Category">
        <select
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[13px] outline-none transition-[box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="all">All categories</option>
          {JOB_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Job type">
        <Chips
          options={JOB_TYPES}
          selected={value.jobType}
          onSelect={(jobType) => onChange({ jobType })}
        />
      </Field>

      <Field label="Work mode">
        <Chips
          options={WORK_MODES}
          selected={value.workMode}
          onSelect={(workMode) => onChange({ workMode })}
        />
      </Field>

      <Field label="Experience">
        <Chips
          options={EXPERIENCE_LEVELS.map((level): [string, string] => [level, level])}
          selected={value.experienceLevel}
          onSelect={(experienceLevel) => onChange({ experienceLevel })}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

/** Tap a selected chip again to clear it. */
function Chips({
  options,
  selected,
  onSelect,
}: {
  options: readonly (readonly [string, string])[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([optionValue, text]) => {
        const active = selected === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? "all" : optionValue)}
            className={cn(
              "h-7 rounded-full border px-2.5 text-xs transition-colors",
              active
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}