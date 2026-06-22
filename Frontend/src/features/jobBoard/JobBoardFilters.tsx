import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PublicJobFilters, PublicJobSort } from "@/types/jobPosting";

export interface JobBoardFilterState {
  q: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  sort: PublicJobSort;
}

export const defaultFilterState: JobBoardFilterState = {
  q: "",
  location: "",
  jobType: "",
  workMode: "",
  salaryMin: "",
  salaryMax: "",
  sort: "newest",
};

export function filtersToQuery(state: JobBoardFilterState, page = 1): PublicJobFilters {
  const filters: PublicJobFilters = { page, limit: 20, sort: state.sort };
  if (state.q.trim()) filters.q = state.q.trim();
  if (state.location.trim()) filters.location = state.location.trim();
  if (state.jobType) filters.jobType = state.jobType;
  if (state.workMode) filters.workMode = state.workMode;
  if (state.salaryMin) filters.salaryMin = Number(state.salaryMin);
  if (state.salaryMax) filters.salaryMax = Number(state.salaryMax);
  return filters;
}

interface JobBoardFiltersProps {
  state: JobBoardFilterState;
  onChange: (patch: Partial<JobBoardFilterState>) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  compact?: boolean;
}

export function JobBoardFilterFields({
  state,
  onChange,
  onReset,
}: Pick<JobBoardFiltersProps, "state" | "onChange" | "onReset">) {
  return <FilterFields state={state} onChange={onChange} onReset={onReset} />;
}

function FilterFields({
  state,
  onChange,
  onReset,
}: Omit<JobBoardFiltersProps, "onSearchChange" | "compact">) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="filter-location">Location</Label>
        <Input
          id="filter-location"
          placeholder="e.g. Nairobi, Remote"
          value={state.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Job type</Label>
        <Select
          value={state.jobType || "all"}
          onValueChange={(v) => onChange({ jobType: v === "all" ? "" : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Work mode</Label>
        <Select
          value={state.workMode || "all"}
          onValueChange={(v) => onChange({ workMode: v === "all" ? "" : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="salary-min">Min salary</Label>
          <Input
            id="salary-min"
            type="number"
            min={0}
            placeholder="50000"
            value={state.salaryMin}
            onChange={(e) => onChange({ salaryMin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary-max">Max salary</Label>
          <Input
            id="salary-max"
            type="number"
            min={0}
            placeholder="120000"
            value={state.salaryMax}
            onChange={(e) => onChange({ salaryMax: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={state.sort}
          onValueChange={(v) => onChange({ sort: v as PublicJobSort })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="salary">Highest salary</SelectItem>
            <SelectItem value="relevance">Relevance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}

export default function JobBoardFilters({
  state,
  onChange,
  onSearchChange,
  onReset,
  compact = false,
}: JobBoardFiltersProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, companies, skills…"
          className="pl-9"
          value={state.q}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search jobs"
        />
      </div>

      {!compact && (
        <div className="hidden lg:block">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <FilterFields state={state} onChange={onChange} onReset={onReset} />
        </div>
      )}

      {compact && <FilterFields state={state} onChange={onChange} onReset={onReset} />}
    </div>
  );
}
