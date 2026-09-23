"use client";

import { Eye, Loader2, Rocket, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_TYPES,
  WORK_MODES,
} from "@/lib/jobPostings/options";
import type { ApplyMethodType } from "@/types/jobPosting";
import type { EmployerJobPayload } from "@/types/employer";

export const emptyJobPostingForm: EmployerJobPayload = {
  companyName: "",
  title: "",
  category: "",
  description: "",
  responsibilities: "",
  requirements: "",
  location: "",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "KES",
  jobType: "full-time",
  workMode: "onsite",
  experienceLevel: "",
  educationLevel: "",
  certifications: "",
  tags: [],
  applyMethod: { type: "external_link", value: "" },
  applicationDeadline: null,
};

const CURRENCIES = ["KES", "EUR", "GBP", "KES", "NGN", "ZAR", "INR"];

// The public job board's apply flow also supports WhatsApp (see
// lib/job-board/applyActions.ts) for any legacy postings created that way,
// but new postings are limited to the two methods employers are asked for.
const APPLY_METHODS: [ApplyMethodType, string][] = [
  ["external_link", "External URL"],
  ["email", "Email"],
];

interface JobPostingFormProps {
  value: EmployerJobPayload;
  onChange: (patch: Partial<EmployerJobPayload>) => void;
  /** Persists the current field values without changing lifecycle status. */
  onSaveDraft: (e: React.FormEvent) => void;
  /** Opens a read-only preview of the posting as job seekers would see it. */
  onPreview: () => void;
  /**
   * Saves the current field values and moves the posting to "published" in
   * one step. Omit to hide the button (e.g. a published/closed posting
   * being edited — use the lifecycle actions in `extraActions` instead).
   */
  onPublish?: () => void;
  isSubmitting?: boolean;
  /** Lifecycle controls (unpublish / close / delete) for an existing posting. */
  extraActions?: React.ReactNode;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function JobPostingForm({
  value,
  onChange,
  onSaveDraft,
  onPreview,
  onPublish,
  isSubmitting,
  extraActions,
}: JobPostingFormProps) {
  const tagsInput = value.tags?.join(", ") || "";

  const setApplyMethod = (patch: Partial<{ type: ApplyMethodType; value: string }>) => {
    onChange({
      applyMethod: { ...value.applyMethod, ...patch },
    });
  };

  return (
    <form onSubmit={onSaveDraft} className="space-y-6">
      <Section title="Company information" description="Shown to job seekers on every listing.">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name *</Label>
          <Input
            id="companyName"
            value={value.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Savannah Technologies Ltd."
            required
          />
          <p className="text-xs text-muted-foreground">
            This name is managed independently for this posting.
          </p>
        </div>
      </Section>

      <Section title="Job details" description="Title, category, classification, and where the role is based.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Job title *</Label>
            <Input
              id="title"
              value={value.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Software Engineer"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Job category *</Label>
            <Input
              id="category"
              value={value.category || ""}
              onChange={(e) => onChange({ category: e.target.value })}
              placeholder="Software Development"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={value.location || ""}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Nairobi, Kenya"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Employment type *</Label>
            <Select value={value.jobType} onValueChange={(v) => onChange({ jobType: v ?? "full-time" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Workplace type *</Label>
            <Select value={value.workMode} onValueChange={(v) => onChange({ workMode: v ?? "onsite" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORK_MODES.map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium text-foreground">Salary range (optional)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Min salary</Label>
            <Input
              id="salaryMin"
              type="number"
              min={0}
              value={value.salaryMin ?? ""}
              onChange={(e) => onChange({ salaryMin: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax">Max salary</Label>
            <Input
              id="salaryMax"
              type="number"
              min={0}
              value={value.salaryMax ?? ""}
              onChange={(e) => onChange({ salaryMax: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={value.salaryCurrency || "KES"} onValueChange={(v) => onChange({ salaryCurrency: v ?? "KES" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="applicationDeadline">Application deadline (optional)</Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={value.applicationDeadline ?? ""}
              onChange={(e) => onChange({ applicationDeadline: e.target.value || null })}
            />
            <p className="text-xs text-muted-foreground">
              After this date, the listing stays visible but apply is disabled.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Job description" description="What the role involves day to day.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Job description *</Label>
            <Textarea
              id="description"
              rows={6}
              value={value.description}
              onChange={(e) => onChange({ description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities *</Label>
            <Textarea
              id="responsibilities"
              rows={5}
              value={value.responsibilities || ""}
              onChange={(e) => onChange({ responsibilities: e.target.value })}
              placeholder="One responsibility per line works well."
              required
            />
          </div>
        </div>
      </Section>

      <Section title="Requirements" description="What you expect from candidates.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">Qualifications *</Label>
            <Textarea
              id="requirements"
              rows={4}
              value={value.requirements || ""}
              onChange={(e) => onChange({ requirements: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Skills (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => {
                onChange({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                });
              }}
              placeholder="react, node, postgresql"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level *</Label>
              <Input
                id="experienceLevel"
                value={value.experienceLevel || ""}
                onChange={(e) => onChange({ experienceLevel: e.target.value })}
                placeholder="Entry level / 0–2 years"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education level *</Label>
              <Input
                id="educationLevel"
                value={value.educationLevel || ""}
                onChange={(e) => onChange({ educationLevel: e.target.value })}
                placeholder="Diploma / Bachelor's degree"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (optional)</Label>
            <Input
              id="certifications"
              value={value.certifications || ""}
              onChange={(e) => onChange({ certifications: e.target.value })}
              placeholder="AWS Certified Solutions Architect, PMP, etc."
            />
          </div>
        </div>
      </Section>

      <Section title="Application" description="Candidates apply externally — no in-platform applications.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Application method *</Label>
            <Select
              value={value.applyMethod.type}
              onValueChange={(v) => setApplyMethod({ type: v as ApplyMethodType })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APPLY_METHODS.map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
                {value.applyMethod.type === "whatsapp" && (
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applyValue">
              {value.applyMethod.type === "email"
                ? "Application email"
                : value.applyMethod.type === "whatsapp"
                  ? "Phone number"
                  : "Application URL"}
            </Label>
            <Input
              id="applyValue"
              value={value.applyMethod.value}
              onChange={(e) => setApplyMethod({ value: e.target.value })}
              placeholder={
                value.applyMethod.type === "email"
                  ? "careers@company.com"
                  : value.applyMethod.type === "whatsapp"
                    ? "254712345678"
                    : "https://company.com/careers"
              }
              required
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          Save draft
        </Button>
        <Button type="button" variant="ghost" onClick={onPreview} disabled={isSubmitting}>
          <Eye />
          Preview
        </Button>
        {onPublish && (
          <Button type="button" onClick={onPublish} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Rocket />}
            Publish job
          </Button>
        )}
        {extraActions}
      </div>
    </form>
  );
}
