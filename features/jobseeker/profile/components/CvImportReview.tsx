"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  countSelected,
  type CvImportReview as Review,
  type ReviewItem,
  type ReviewSection,
} from "../lib/cvImportMerge";

interface Props {
  fileName: string;
  review: Review;
  /** Years the profile would show if the current selection were applied. */
  yearsPreview: number | null;
  onToggleItem: (id: string, selected: boolean) => void;
  onToggleSection: (section: ReviewSection, selected: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}

function Section({
  title,
  section,
  items,
  onToggleSection,
  children,
}: {
  title: string;
  section: ReviewSection;
  items: Array<{ selected: boolean }>;
  onToggleSection: Props["onToggleSection"];
  children: ReactNode;
}) {
  if (items.length === 0) return null;
  const selected = items.filter((i) => i.selected).length;
  const all = selected === items.length;
  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title} <span className="font-normal normal-case">({selected}/{items.length} selected)</span>
        </h3>
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => onToggleSection(section, !all)}>
          {all ? "Clear" : "Select all"}
        </Button>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row<T>({ item, onToggle }: { item: ReviewItem<T>; onToggle: Props["onToggleItem"] }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs">
      <Checkbox className="mt-0.5" checked={item.selected} onCheckedChange={(checked) => onToggle(item.id, checked === true)} />
      <span className="min-w-0 flex-1">
        <span className="block break-words font-medium">{item.label}</span>
        {item.detail && <span className="block break-words text-[11px] text-muted-foreground">{item.detail}</span>}
        {item.duplicate && <span className="block text-[11px] text-amber-600 dark:text-amber-400">Already in your profile - skipped by default</span>}
        {item.conflictWith && (
          <span className="block break-words text-[11px] text-amber-600 dark:text-amber-400">
            Replaces your current value: {item.conflictWith.length > 80 ? `${item.conflictWith.slice(0, 80)}…` : item.conflictWith}
          </span>
        )}
      </span>
    </label>
  );
}

export default function CvImportReview({ fileName, review, yearsPreview, onToggleItem, onToggleSection, onApply, onCancel }: Props) {
  const total = countSelected(review);
  const summaryItems = review.summary ? [review.summary] : [];
  const yearsItems = review.years ? [review.years] : [];

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-3">
      <div>
        <p className="text-sm font-semibold">CV import complete</p>
        <p className="mt-0.5 break-words text-[11px] text-muted-foreground">
          {fileName} · {review.skills.length} skills · {review.experience.length} work experiences · {review.education.length} education
          · {review.certifications.length} certifications
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Choose what to add. Your existing profile is kept; nothing is saved until you press Save changes.
        </p>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
        <Section title="Personal information" section="personal" items={review.personal} onToggleSection={onToggleSection}>
          {review.personal.map((item) => (
            <Row key={item.id} item={{ ...item, detail: item.value }} onToggle={onToggleItem} />
          ))}
          {review.cvEmail && (
            <p className="px-1 text-[11px] text-muted-foreground">Email in CV ({review.cvEmail}) is not imported - your account email stays unchanged.</p>
          )}
        </Section>

        <Section title="Professional summary" section="summary" items={summaryItems} onToggleSection={onToggleSection}>
          {review.summary && <Row item={{ ...review.summary, detail: review.summary.value.length > 160 ? `${review.summary.value.slice(0, 160)}…` : review.summary.value }} onToggle={onToggleItem} />}
        </Section>

        <Section title="Skills" section="skills" items={review.skills} onToggleSection={onToggleSection}>
          <div className="grid gap-1 sm:grid-cols-2">
            {review.skills.map((item) => <Row key={item.id} item={item} onToggle={onToggleItem} />)}
          </div>
        </Section>

        <Section title="Work experience" section="experience" items={review.experience} onToggleSection={onToggleSection}>
          {review.experience.map((item) => <Row key={item.id} item={item} onToggle={onToggleItem} />)}
        </Section>

        <Section title="Education" section="education" items={review.education} onToggleSection={onToggleSection}>
          {review.education.map((item) => <Row key={item.id} item={item} onToggle={onToggleItem} />)}
        </Section>

        <Section title="Certifications" section="certifications" items={review.certifications} onToggleSection={onToggleSection}>
          {review.certifications.map((item) => <Row key={item.id} item={item} onToggle={onToggleItem} />)}
        </Section>

        <Section title="Target roles stated in your CV" section="targetRoles" items={review.targetRoles} onToggleSection={onToggleSection}>
          {review.targetRoles.map((item) => <Row key={item.id} item={item} onToggle={onToggleItem} />)}
        </Section>

        <Section title="Years of experience" section="years" items={yearsItems} onToggleSection={onToggleSection}>
          {review.years && (
            <Row
              item={{
                ...review.years,
                label: yearsPreview === null ? "Years of experience" : `${yearsPreview} year(s) of experience`,
                detail: "Calculated from work history; overlapping jobs are counted once",
              }}
              onToggle={onToggleItem}
            />
          )}
        </Section>
      </div>

      {review.warnings.length > 0 && (
        <p className="text-[11px] text-muted-foreground">Some details may need review: {review.warnings.join(" ")}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onApply} disabled={total === 0}>
          Add {total} selected item{total === 1 ? "" : "s"} to form
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
