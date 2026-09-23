"use client";

import { BriefcaseBusiness, GraduationCap, LayoutGrid, Monitor, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EXPERIENCE_LEVELS, JOB_CATEGORIES, JOB_TYPES as JOB_TYPE_OPTIONS, WORK_MODES as WORK_MODE_OPTIONS } from "@/lib/jobPostings/options";
import { cn } from "@/lib/utils";

export interface JobBoardFilterValue {
  location: string;
  category: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
}

const CATEGORIES: [string, string][] = [
  ["all", "All categories"],
  ...JOB_CATEGORIES.map((c): [string, string] => [c, c]),
];

const JOB_TYPES: [string, string][] = [["all", "All job types"], ...JOB_TYPE_OPTIONS];

const WORK_MODES: [string, string][] = [["all", "All work modes"], ...WORK_MODE_OPTIONS];

const EXPERIENCE: [string, string][] = [
  ["all", "All levels"],
  ...EXPERIENCE_LEVELS.map((level): [string, string] => [level, level]),
];

interface JobBoardFiltersProps {
  value: JobBoardFilterValue;
  onChange: (patch: Partial<JobBoardFilterValue>) => void;
  onClear: () => void;
}

/**
 * A real sidebar built on the same filters the job board API accepts
 * (location, job type, work mode) — single-select, since the backend
 * matches one value per field rather than a set.
 */
export default function JobBoardFilters({ value, onChange, onClear }: JobBoardFiltersProps) {
  const active =
    value.location.trim() !== "" ||
    value.category !== "all" ||
    value.jobType !== "all" ||
    value.workMode !== "all" ||
    value.experienceLevel !== "all";

  return (
    <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-5 shadow-xs lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {active && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          value={value.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="City, state, or country"
          className="h-9 text-sm"
        />
      </div>

      <FilterGroup
        icon={LayoutGrid}
        label="Category"
        options={CATEGORIES}
        selected={value.category}
        onSelect={(category) => onChange({ category })}
      />

      <FilterGroup
        icon={BriefcaseBusiness}
        label="Job type"
        options={JOB_TYPES}
        selected={value.jobType}
        onSelect={(jobType) => onChange({ jobType })}
      />

      <FilterGroup
        icon={Monitor}
        label="Work mode"
        options={WORK_MODES}
        selected={value.workMode}
        onSelect={(workMode) => onChange({ workMode })}
      />

      <FilterGroup
        icon={GraduationCap}
        label="Experience level"
        options={EXPERIENCE}
        selected={value.experienceLevel}
        onSelect={(experienceLevel) => onChange({ experienceLevel })}
      />
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-foreground">{children}</p>;
}

function FilterGroup({
  icon: Icon,
  label,
  options,
  selected,
  onSelect,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  options: [string, string][];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center gap-1.5 text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <Label>{label}</Label>
      </div>
      <div className="flex flex-col gap-1">
        {options.map(([optionValue, text]) => (
          <button
            key={optionValue}
            onClick={() => onSelect(optionValue)}
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition",
              selected === optionValue
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </section>
  );
}
