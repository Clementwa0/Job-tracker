"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AiActions } from "@/features/jobseeker/resumes/components/AiAssist";
import type { ResumeAssistController } from "@/features/jobseeker/resumes/useResumeAssist";
import { skillsText } from "@/lib/resume/improve";
import {
  uid,
  type ResumeData,
  type ResumeExperience,
} from "@/lib/resume/types";

type P = {
  data: ResumeData;
  onChange: (d: ResumeData) => void;
  ai?: ResumeAssistController;
};

function Section({
  title,
  count,
  children,
  open: initial = false,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  open?: boolean;
}) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card/70 shadow-sm backdrop-blur-sm">
      <Button
        onClick={() => setOpen(!open)}
        variant="ghost"
        className="flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-left hover:bg-muted/60"
      >
        <span className="font-semibold">
          {title}
          {count != null && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>
      {open && (
        <div className="space-y-4 border-t border-border bg-background/35 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

function F({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Item({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="relative space-y-3 rounded-md border border-border/70 bg-background/55 p-3 pr-11 shadow-sm">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1"
        aria-label="Remove"
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
      {children}
    </div>
  );
}

function list<T extends { id: string }>(items: T[], set: (v: T[]) => void) {
  return {
    patch: (id: string, p: Partial<T>) =>
      set(items.map((x) => (x.id === id ? { ...x, ...p } : x))),
    remove: (id: string) => set(items.filter((x) => x.id !== id)),
  };
}
const csv = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function ContentEditor({ data, onChange, ai }: P) {
  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    onChange({ ...data, [k]: v });
  const c = data.contact;
  const setC = (k: keyof typeof c) => (v: string) =>
    set("contact", { ...c, [k]: v });
  const exp = list(data.experience, (v) => set("experience", v));
  const edu = list(data.education, (v) => set("education", v));
  const proj = list(data.projects, (v) => set("projects", v));
  const sk = list(data.skills, (v) => set("skills", v));
  const cert = list(data.certifications, (v) => set("certifications", v));
  const lang = list(data.languages, (v) => set("languages", v));

  return (
    <div className="space-y-3">
      <Section title="Contact" open>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="Full name" value={c.fullName} onChange={setC("fullName")} />
          <F label="Job title" value={c.title} onChange={setC("title")} />
          <F
            label="Email"
            type="email"
            value={c.email}
            onChange={setC("email")}
          />
          <F label="Phone" value={c.phone} onChange={setC("phone")} />
          <F label="Location" value={c.location} onChange={setC("location")} />
          <F label="Website" value={c.website} onChange={setC("website")} />
          <F label="LinkedIn" value={c.linkedin} onChange={setC("linkedin")} />
          <F label="GitHub" value={c.github} onChange={setC("github")} />
        </div>
      </Section>

      <Section title="Summary">
        <Textarea
          rows={5}
          value={data.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="2–3 sentences about what you do best."
        />
        {ai && (
          <AiActions
            ai={ai}
            target={{ kind: "summary" }}
            actions={["rewrite_summary", "shorten", "improve_keywords"]}
            current={data.summary}
          />
        )}
      </Section>

      <Section title="Experience" count={data.experience.length}>
        {data.experience.map((x) => (
          <ExperienceItem
            key={x.id}
            x={x}
            patch={(p) => exp.patch(x.id, p)}
            remove={() => exp.remove(x.id)}
            ai={ai}
          />
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("experience", [
              ...data.experience,
              {
                id: uid(),
                company: "",
                role: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                bullets: [""],
              },
            ])
          }
        >
          <Plus /> Add experience
        </Button>
      </Section>

      <Section title="Education" count={data.education.length}>
        {data.education.map((x) => (
          <Item key={x.id} onRemove={() => edu.remove(x.id)}>
            <F
              label="School"
              value={x.school}
              onChange={(v) => edu.patch(x.id, { school: v })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F
                label="Degree"
                value={x.degree}
                onChange={(v) => edu.patch(x.id, { degree: v })}
              />
              <F
                label="Field"
                value={x.field}
                onChange={(v) => edu.patch(x.id, { field: v })}
              />
              <F
                label="Start"
                type="month"
                value={x.startDate}
                onChange={(v) => edu.patch(x.id, { startDate: v })}
              />
              <F
                label="End"
                type="month"
                value={x.endDate}
                onChange={(v) => edu.patch(x.id, { endDate: v })}
              />
            </div>
            <F
              label="Notes"
              value={x.notes}
              onChange={(v) => edu.patch(x.id, { notes: v })}
              placeholder="Honours, GPA…"
            />
          </Item>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("education", [
              ...data.education,
              {
                id: uid(),
                school: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                notes: "",
              },
            ])
          }
        >
          <Plus /> Add education
        </Button>
      </Section>

      <Section title="Skills" count={data.skills.length}>
        {data.skills.map((x) => (
          <Item key={x.id} onRemove={() => sk.remove(x.id)}>
            <F
              label="Category"
              value={x.category}
              onChange={(v) => sk.patch(x.id, { category: v })}
            />
            <CsvField
              label="Skills (comma separated)"
              value={x.items}
              onChange={(v) => sk.patch(x.id, { items: v })}
            />
          </Item>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("skills", [
              ...data.skills,
              { id: uid(), category: "", items: [] },
            ])
          }
        >
          <Plus /> Add skill group
        </Button>
        {ai && (
          <AiActions
            ai={ai}
            target={{ kind: "skills" }}
            actions={["improve_keywords"]}
            current={skillsText(data.skills)}
          />
        )}
      </Section>

      <Section title="Projects" count={data.projects.length}>
        {data.projects.map((x) => (
          <Item key={x.id} onRemove={() => proj.remove(x.id)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F
                label="Name"
                value={x.name}
                onChange={(v) => proj.patch(x.id, { name: v })}
              />
              <F
                label="Link"
                value={x.url}
                onChange={(v) => proj.patch(x.id, { url: v })}
              />
            </div>
            <Textarea
              rows={2}
              value={x.description}
              placeholder="What it does and the result"
              onChange={(e) =>
                proj.patch(x.id, { description: e.target.value })
              }
            />
            {ai && (
              <AiActions
                ai={ai}
                target={{ kind: "project", id: x.id }}
                actions={["improve_bullet", "quantify", "shorten"]}
                current={x.description}
              />
            )}
            <CsvField
              label="Tools (comma separated)"
              value={x.tech}
              onChange={(v) => proj.patch(x.id, { tech: v })}
            />
          </Item>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("projects", [
              ...data.projects,
              { id: uid(), name: "", url: "", description: "", tech: [] },
            ])
          }
        >
          <Plus /> Add project
        </Button>
      </Section>

      <Section title="Certifications" count={data.certifications.length}>
        {data.certifications.map((x) => (
          <Item key={x.id} onRemove={() => cert.remove(x.id)}>
            <F
              label="Name"
              value={x.name}
              onChange={(v) => cert.patch(x.id, { name: v })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F
                label="Issuer"
                value={x.issuer}
                onChange={(v) => cert.patch(x.id, { issuer: v })}
              />
              <F
                label="Year"
                value={x.date}
                onChange={(v) => cert.patch(x.id, { date: v })}
              />
            </div>
          </Item>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("certifications", [
              ...data.certifications,
              { id: uid(), name: "", issuer: "", date: "", url: "" },
            ])
          }
        >
          <Plus /> Add certification
        </Button>
      </Section>

      <Section title="Languages" count={data.languages.length}>
        {data.languages.map((x) => (
          <Item key={x.id} onRemove={() => lang.remove(x.id)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F
                label="Language"
                value={x.name}
                onChange={(v) => lang.patch(x.id, { name: v })}
              />
              <F
                label="Level"
                value={x.level}
                onChange={(v) => lang.patch(x.id, { level: v })}
                placeholder="Fluent"
              />
            </div>
          </Item>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set("languages", [
              ...data.languages,
              { id: uid(), name: "", level: "" },
            ])
          }
        >
          <Plus /> Add language
        </Button>
      </Section>
    </div>
  );
}

function CsvField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(csv(e.target.value));
        }}
      />
    </div>
  );
}

function ExperienceItem({
  x,
  patch,
  remove,
  ai,
}: {
  x: ResumeExperience;
  patch: (p: Partial<ResumeExperience>) => void;
  remove: () => void;
  ai?: ResumeAssistController;
}) {
  return (
    <Item onRemove={remove}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <F label="Role" value={x.role} onChange={(v) => patch({ role: v })} />
        <F
          label="Company"
          value={x.company}
          onChange={(v) => patch({ company: v })}
        />
        <F
          label="Start"
          type="month"
          value={x.startDate}
          onChange={(v) => patch({ startDate: v })}
        />
        {x.current ? (
          <div className="flex items-end pb-2 text-sm text-muted-foreground">
            Present
          </div>
        ) : (
          <F
            label="End"
            type="month"
            value={x.endDate}
            onChange={(v) => patch({ endDate: v })}
          />
        )}
        <F
          label="Location"
          value={x.location}
          onChange={(v) => patch({ location: v })}
        />
        <label className="flex items-end gap-2 pb-2 text-sm">
          <Switch
            checked={x.current}
            onCheckedChange={(v) => patch({ current: v })}
          />{" "}
          I work here now
        </label>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Achievements</Label>
        {x.bullets.map((b, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-1">
              <Textarea
                rows={2}
                value={b}
                className="min-h-0"
                placeholder="Led… / Built… / Reduced… by 20%"
                onChange={(e) =>
                  patch({
                    bullets: x.bullets.map((y, j) =>
                      j === i ? e.target.value : y,
                    ),
                  })
                }
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove bullet"
                onClick={() =>
                  patch({ bullets: x.bullets.filter((_, j) => j !== i) })
                }
              >
                <Trash2 />
              </Button>
            </div>
            {ai && (
              <AiActions
                ai={ai}
                target={{ kind: "bullet", id: x.id, index: i }}
                actions={["improve_bullet", "quantify", "shorten"]}
                current={b}
              />
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => patch({ bullets: [...x.bullets, ""] })}
          >
            <Plus /> Bullet
          </Button>
        </div>
      </div>
    </Item>
  );
}
