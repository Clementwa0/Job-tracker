import { useEffect, useState } from "react";
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
import type { ApplyMethodType } from "@/types/jobPosting";
import type { EmployerJobPayload } from "@/types/employer";

export const emptyJobPostingForm: EmployerJobPayload = {
  title: "",
  description: "",
  requirements: "",
  location: "",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "USD",
  jobType: "full-time",
  workMode: "remote",
  tags: [],
  applyMethod: { type: "external_link", value: "" },
  applicationDeadline: null,
};

const CURRENCIES = ["USD", "EUR", "GBP", "KES", "NGN", "ZAR", "INR"];

interface JobPostingFormProps {
  value: EmployerJobPayload;
  onChange: (patch: Partial<EmployerJobPayload>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  extraActions?: React.ReactNode;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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
  onSubmit,
  submitLabel,
  isSubmitting,
  extraActions,
}: JobPostingFormProps) {
  const [tagsInput, setTagsInput] = useState(value.tags?.join(", ") || "");

  useEffect(() => {
    setTagsInput(value.tags?.join(", ") || "");
  }, [value.tags]);

  const setApplyMethod = (patch: Partial<{ type: ApplyMethodType; value: string }>) => {
    onChange({
      applyMethod: { ...value.applyMethod, ...patch },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Basic information" description="Title, location, and job classification.">
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
            <Label>Job type</Label>
            <Select value={value.jobType} onValueChange={(v) => onChange({ jobType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Work mode</Label>
            <Select value={value.workMode} onValueChange={(v) => onChange({ workMode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="applicationDeadline">Application deadline</Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={value.applicationDeadline ?? ""}
              onChange={(e) =>
                onChange({ applicationDeadline: e.target.value || null })
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional. After this date, the listing stays visible but apply is disabled.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tags">Skills / tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                onChange({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                });
              }}
              placeholder="react, node, mongodb"
            />
          </div>
        </div>
      </Section>

      <Section title="Description" description="What the role involves and what you expect from candidates.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={6}
              value={value.description}
              onChange={(e) => onChange({ description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              rows={4}
              value={value.requirements || ""}
              onChange={(e) => onChange({ requirements: e.target.value })}
            />
          </div>
        </div>
      </Section>

      <Section title="Compensation" description="Optional salary range shown on the public listing.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Min salary</Label>
            <Input
              id="salaryMin"
              type="number"
              min={0}
              value={value.salaryMin ?? ""}
              onChange={(e) =>
                onChange({ salaryMin: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax">Max salary</Label>
            <Input
              id="salaryMax"
              type="number"
              min={0}
              value={value.salaryMax ?? ""}
              onChange={(e) =>
                onChange({ salaryMax: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={value.salaryCurrency || "USD"}
              onValueChange={(v) => onChange({ salaryCurrency: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Apply method" description="Candidates apply externally — no in-platform applications.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Apply method</Label>
            <Select
              value={value.applyMethod.type}
              onValueChange={(v) => setApplyMethod({ type: v as ApplyMethodType })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="external_link">External link</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applyValue">
              {value.applyMethod.type === "email"
                ? "Email address"
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
        {extraActions}
      </div>
    </form>
  );
}
