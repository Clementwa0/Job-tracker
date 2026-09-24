"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { FileUp, Loader2, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/features/jobseeker/settings/hooks/useProfile";
import type { ProfileUpdate } from "@/features/jobseeker/settings/services/profile.client";
import { importCv, type CvImportResult } from "@/features/jobseeker/settings/services/cvImport.client";
import { getApiErrorMessage } from "@/lib/apiError";
import { JOB_TYPE_OPTIONS, WORK_MODE_OPTIONS, labelize } from "@/lib/profile/options";
import type { CertificationEntry, EducationEntry, ProfileResponse, WorkExperienceEntry } from "@/types/profile";

const splitList = (value: string): string[] =>
  [...new Map(value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean).map((v) => [v.toLowerCase(), v])).values()];

const numberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
};

const MAX_PROFILE_SKILLS = 40;

function Field({ label, hint, id, children }: { label: string; hint?: string; id?: string; children: ReactNode }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id: fieldId })
    : children;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId} className="text-xs">{label}</Label>
      {control}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CheckGroup({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={(checked) =>
              onChange(checked === true ? [...selected, option] : selected.filter((s) => s !== option))
            }
          />
          {labelize(option)}
        </label>
      ))}
    </div>
  );
}

const emptyEducation = (): EducationEntry => ({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", currentlyStudying: false });
const emptyCertification = (): CertificationEntry => ({ name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" });
const emptyExperience = (): WorkExperienceEntry => ({ jobTitle: "", company: "", location: "", startDate: "", endDate: "", currentlyWorking: false, description: "" });

function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (value: string[]) => void }) {
  const [value, setValue] = useState("");
  const add = () => {
    const skill = value.trim();
    if (
      !skill ||
      skills.length >= MAX_PROFILE_SKILLS ||
      skills.some((item) => item.toLowerCase() === skill.toLowerCase())
    ) return;
    onChange([...skills, skill]);
    setValue("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder="e.g. React" />
        <Button type="button" variant="outline" onClick={add} disabled={skills.length >= MAX_PROFILE_SKILLS}>
          <Plus /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => <Badge key={skill} variant="secondary">{skill}<button type="button" className="ml-1" onClick={() => onChange(skills.filter((item) => item !== skill))} aria-label={`Remove ${skill}`}><X /></button></Badge>)}
      </div>
    </div>
  );
}

function EducationEditor({ entries, onChange }: { entries: EducationEntry[]; onChange: (value: EducationEntry[]) => void }) {
  const update = (index: number, patch: Partial<EducationEntry>) => onChange(entries.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...patch } : entry));
  return <div className="space-y-3">
    {entries.map((entry, index) => <div key={index} className="space-y-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input aria-label="Institution / School" placeholder="Institution / School" value={entry.institution} onChange={(event) => update(index, { institution: event.target.value })} />
        <Input aria-label="Degree / Qualification" placeholder="Degree / Qualification" value={entry.degree} onChange={(event) => update(index, { degree: event.target.value })} />
        <Input aria-label="Field of Study" placeholder="Field of Study" value={entry.fieldOfStudy} onChange={(event) => update(index, { fieldOfStudy: event.target.value })} />
        <div className="grid grid-cols-2 gap-3"><Input aria-label="Start Date" type="month" value={entry.startDate} onChange={(event) => update(index, { startDate: event.target.value })} /><Input aria-label="End Date" type="month" value={entry.endDate} disabled={entry.currentlyStudying} onChange={(event) => update(index, { endDate: event.target.value })} /></div>
      </div>
      <div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs"><Checkbox checked={entry.currentlyStudying} onCheckedChange={(checked) => update(index, { currentlyStudying: checked === true, endDate: checked === true ? "" : entry.endDate })} /> Currently studying</label><Button type="button" variant="ghost" size="sm" onClick={() => onChange(entries.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div>
    </div>)}
    <Button type="button" variant="outline" onClick={() => onChange([...entries, emptyEducation()])}><Plus /> Add Education</Button>
  </div>;
}

function CertificationEditor({ entries, onChange }: { entries: CertificationEntry[]; onChange: (value: CertificationEntry[]) => void }) {
  const update = (index: number, patch: Partial<CertificationEntry>) => onChange(entries.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...patch } : entry));
  return <div className="space-y-3">
    {entries.map((entry, index) => <div key={index} className="space-y-3 rounded-lg border border-border p-3"><div className="grid gap-3 sm:grid-cols-2">
      <Input aria-label="Certification name" placeholder="Certification name" value={entry.name} onChange={(event) => update(index, { name: event.target.value })} /><Input aria-label="Issuing organization" placeholder="Issuing organization" value={entry.issuer} onChange={(event) => update(index, { issuer: event.target.value })} />
      <Input aria-label="Issue date" type="month" value={entry.issueDate} onChange={(event) => update(index, { issueDate: event.target.value })} /><Input aria-label="Expiry date" type="month" value={entry.expiryDate} onChange={(event) => update(index, { expiryDate: event.target.value })} />
      <Input aria-label="Credential ID" placeholder="Credential ID (optional)" value={entry.credentialId} onChange={(event) => update(index, { credentialId: event.target.value })} /><Input aria-label="Credential URL" type="url" placeholder="Credential URL (optional)" value={entry.credentialUrl} onChange={(event) => update(index, { credentialUrl: event.target.value })} />
    </div><div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => onChange(entries.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div></div>)}
    <Button type="button" variant="outline" onClick={() => onChange([...entries, emptyCertification()])}><Plus /> Add Certification</Button>
  </div>;
}

function ExperienceEditor({ entries, onChange }: { entries: WorkExperienceEntry[]; onChange: (value: WorkExperienceEntry[]) => void }) {
  const update = (index: number, patch: Partial<WorkExperienceEntry>) => onChange(entries.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...patch } : entry));
  return <div className="space-y-3">
    {entries.map((entry, index) => <div key={index} className="space-y-3 rounded-lg border border-border p-3"><div className="grid gap-3 sm:grid-cols-2">
      <Input aria-label="Job title" placeholder="Job title" value={entry.jobTitle} onChange={(event) => update(index, { jobTitle: event.target.value })} /><Input aria-label="Company" placeholder="Company" value={entry.company} onChange={(event) => update(index, { company: event.target.value })} /><Input aria-label="Location" placeholder="Location" value={entry.location} onChange={(event) => update(index, { location: event.target.value })} /><div className="grid grid-cols-2 gap-3"><Input aria-label="Start Date" type="month" value={entry.startDate} onChange={(event) => update(index, { startDate: event.target.value })} /><Input aria-label="End Date" type="month" disabled={entry.currentlyWorking} value={entry.endDate} onChange={(event) => update(index, { endDate: event.target.value })} /></div>
    </div><Textarea aria-label="Description" placeholder="Description" rows={3} value={entry.description} onChange={(event) => update(index, { description: event.target.value })} /><div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs"><Checkbox checked={entry.currentlyWorking} onCheckedChange={(checked) => update(index, { currentlyWorking: checked === true, endDate: checked === true ? "" : entry.endDate })} /> Currently working</label><Button type="button" variant="ghost" size="sm" onClick={() => onChange(entries.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div></div>)}
    <Button type="button" variant="outline" onClick={() => onChange([...entries, emptyExperience()])}><Plus /> Add Experience</Button>
  </div>;
}

function SettingsForm({ initial }: { initial: ProfileResponse }) {
  const { save } = useProfile();
  const p = initial.profile;

  const [name, setName] = useState(initial.name);
  const [headline, setHeadline] = useState(p.headline);
  const [location, setLocation] = useState(p.location);
  const [phone, setPhone] = useState(p.phone);
  const [bio, setBio] = useState(p.bio);
  const [website, setWebsite] = useState(p.website);
  const [linkedinUrl, setLinkedinUrl] = useState(p.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(p.githubUrl);

  const [years, setYears] = useState(p.yearsExperience === null ? "" : String(p.yearsExperience));
  const [skills, setSkills] = useState<string[]>(p.skills ?? []);
  const [education, setEducation] = useState<EducationEntry[]>(p.education ?? []);
  const [certifications, setCertifications] = useState<CertificationEntry[]>(p.certifications ?? []);
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(p.workExperience ?? []);

  const [targetRoles, setTargetRoles] = useState((p.targetRoles ?? []).join(", "));
  const [preferredLocations, setPreferredLocations] = useState((p.preferredLocations ?? []).join(", "));
  const [jobTypes, setJobTypes] = useState<string[]>(p.preferredJobTypes ?? []);
  const [workModes, setWorkModes] = useState<string[]>(p.preferredWorkModes ?? []);
  const [salaryMin, setSalaryMin] = useState(p.expectedSalaryMin === null ? "" : String(p.expectedSalaryMin));
  const [salaryMax, setSalaryMax] = useState(p.expectedSalaryMax === null ? "" : String(p.expectedSalaryMax));
  const [currency, setCurrency] = useState(p.salaryCurrency || "KES");

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [cvImport, setCvImport] = useState<CvImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setIsDirty(true);
    setStatus(null);
  };

  useEffect(() => {
    if (!isDirty) return;
    const warnOnUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [isDirty]);

  const handleCvFile = async (file: File) => {
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setImportError("Please choose a PDF or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImportError("Your CV must be 5 MB or smaller.");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setCvImport(null);
    try {
      setCvImport(await importCv(file));
    } catch (error) {
      setImportError(getApiErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  };

  const applyCvImport = () => {
    if (!cvImport) return;
    const contact = cvImport.contact;
    if (contact.fullName) update(setName, contact.fullName);
    if (contact.title) update(setHeadline, contact.title);
    if (contact.location) update(setLocation, contact.location);
    if (contact.phone) update(setPhone, contact.phone);
    if (contact.website) update(setWebsite, contact.website);
    if (contact.linkedin) update(setLinkedinUrl, contact.linkedin);
    if (contact.github) update(setGithubUrl, contact.github);
    if (cvImport.summary) update(setBio, cvImport.summary);
    const importedSkills = Array.from(
      new Map(
        [...skills, ...cvImport.skills]
          .map((skill) => skill.trim())
          .filter(Boolean)
          .map((skill) => [skill.toLowerCase(), skill]),
      ).values(),
    );
    const skillsWereTruncated = importedSkills.length > MAX_PROFILE_SKILLS;
    if (importedSkills.length) update(setSkills, importedSkills.slice(0, MAX_PROFILE_SKILLS));

    const importedEducation = cvImport.education.map((item) => ({
      institution: item.school,
      degree: item.degree,
      fieldOfStudy: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      currentlyStudying: false,
    }));
    if (importedEducation.length) update(setEducation, [...education, ...importedEducation]);

    const importedCertifications = cvImport.certifications.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      issueDate: item.date,
      expiryDate: "",
      credentialId: "",
      credentialUrl: item.url,
    }));
    if (importedCertifications.length) update(setCertifications, [...certifications, ...importedCertifications]);

    const roles = splitList(cvImport.experience.map((item) => item.role).join(", "));
    if (roles.length) update(setTargetRoles, Array.from(new Map([...splitList(targetRoles), ...roles].map((role) => [role.toLowerCase(), role])).values()).join(", "));
    const importedExperience = cvImport.experience.map((item) => ({
      jobTitle: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      currentlyWorking: item.current,
      description: item.bullets.join("\n"),
    }));
    if (importedExperience.length) update(setWorkExperience, [...workExperience, ...importedExperience]);
    const years = cvImport.experience
      .map((item) => ({ start: Date.parse(`${item.startDate || ""}-01`), end: item.current ? Date.now() : Date.parse(`${item.endDate || ""}-01`) }))
      .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))
      .reduce((total, item) => total + Math.max(0, item.end - item.start), 0);
    if (years > 0) update(setYears, String(Math.floor(years / (365.25 * 24 * 60 * 60 * 1000))));

    setCvImport(null);
    setStatus({
      ok: true,
      message: skillsWereTruncated
        ? `CV details added. Only the first ${MAX_PROFILE_SKILLS} skills were kept; review them before saving.`
        : "CV details added to the form. Review them, then save your changes.",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const yearsValue = numberOrNull(years);
    const salaryMinValue = numberOrNull(salaryMin);
    const salaryMaxValue = numberOrNull(salaryMax);
    const normalizedCurrency = currency.trim().toUpperCase();
    const validationMessage =
      (years.trim() && (yearsValue === null || yearsValue < 0 || yearsValue > 60) && "Years of experience must be between 0 and 60.") ||
      (salaryMin.trim() && salaryMinValue === null && "Minimum salary must be a valid number.") ||
      (salaryMax.trim() && salaryMaxValue === null && "Maximum salary must be a valid number.") ||
      (salaryMinValue !== null && salaryMinValue < 0 && "Minimum salary cannot be negative.") ||
      (salaryMaxValue !== null && salaryMaxValue < 0 && "Maximum salary cannot be negative.") ||
      (salaryMinValue !== null && salaryMaxValue !== null && salaryMinValue > salaryMaxValue && "Minimum salary cannot exceed maximum salary.") ||
      (!/^[A-Z]{3}$/.test(normalizedCurrency) && "Currency must be a 3-letter code, such as KES or USD.");
    if (validationMessage) {
      setStatus({ ok: false, message: validationMessage });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const patch: ProfileUpdate = {
      name,
      headline,
      location,
      phone,
      bio,
      website,
      linkedinUrl,
      githubUrl,
      yearsExperience: yearsValue,
      skills,
      education,
      certifications,
      workExperience,
      targetRoles: splitList(targetRoles),
      preferredLocations: splitList(preferredLocations),
      preferredJobTypes: jobTypes,
      preferredWorkModes: workModes,
      expectedSalaryMin: salaryMinValue,
      expectedSalaryMax: salaryMaxValue,
      salaryCurrency: normalizedCurrency,
    };

    try {
      const next = await save(patch);
      setIsDirty(false);
      setStatus({ ok: true, message: `Saved - your profile is ${next.completeness.percentage}% complete.` });
    } catch (error) {
      setStatus({ ok: false, message: getApiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
      <fieldset disabled={isSaving} className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Profile &amp; Preferences</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          This powers your profile completeness and the jobs recommended to you. Skills,
          experience and education are also read from your resumes.
        </p>
      </div>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Profile</h2>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Import your CV</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Import your CV to quickly fill your profile. You can review and edit the extracted information before saving.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
              {isImporting ? <Loader2 className="animate-spin" /> : <FileUp />}
              {isImporting ? "Analyzing your CV…" : "Upload CV"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCvFile(file);
                event.target.value = "";
              }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Supported formats: PDF, DOCX · Maximum size: 5 MB</p>
          {importError && <p role="alert" className="mt-2 text-xs text-destructive">{importError}</p>}
          {cvImport && (
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Review extracted information</p>
                <Button type="button" variant="ghost" size="icon" onClick={() => setCvImport(null)} aria-label="Cancel CV import">
                  <X />
                </Button>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <p><span className="font-medium">Name:</span> {cvImport.contact.fullName || "Not found"}</p>
                <p><span className="font-medium">Email:</span> {cvImport.contact.email || "Not found"}</p>
                <p><span className="font-medium">Headline:</span> {cvImport.contact.title || "Not found"}</p>
                <p><span className="font-medium">Location:</span> {cvImport.contact.location || "Not found"}</p>
                <p><span className="font-medium">Skills:</span> {cvImport.skills.join(", ") || "Not found"}</p>
                <p><span className="font-medium">Experience:</span> {cvImport.experience.length ? `${cvImport.experience.length} role(s)` : "Not found"}</p>
                <p className="sm:col-span-2"><span className="font-medium">Summary:</span> {cvImport.summary || "Not found"}</p>
                <p className="sm:col-span-2"><span className="font-medium">Education:</span> {cvImport.education.map((item) => [item.degree, item.field, item.school].filter(Boolean).join(" · ")).join(", ") || "Not found"}</p>
                <p className="sm:col-span-2"><span className="font-medium">Certifications:</span> {cvImport.certifications.map((item) => [item.name, item.issuer].filter(Boolean).join(" · ")).join(", ") || "Not found"}</p>
              </div>
              {cvImport.warnings.length > 0 && <p className="text-[11px] text-muted-foreground">Some details may need review: {cvImport.warnings.join(" ")}</p>}
              <div className="flex gap-2">
                <Button type="button" onClick={applyCvImport}>Apply to Profile</Button>
                <Button type="button" variant="ghost" onClick={() => setCvImport(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input name="name" autoComplete="name" value={name} onChange={(e) => update(setName, e.target.value)} required maxLength={100} />
          </Field>
          <Field label="Professional headline" hint="e.g. Frontend Developer">
            <Input name="headline" value={headline} onChange={(e) => update(setHeadline, e.target.value)} maxLength={160} />
          </Field>
          <Field label="Location" hint="City, Country">
            <Input name="location" autoComplete="address-level2" value={location} onChange={(e) => update(setLocation, e.target.value)} maxLength={120} />
          </Field>
          <Field label="Phone">
            <Input name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => update(setPhone, e.target.value)} maxLength={40} />
          </Field>
        </div>
        <Field label="About you">
          <Textarea name="bio" value={bio} onChange={(e) => update(setBio, e.target.value)} maxLength={2000} rows={3} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Website">
            <Input name="website" type="url" autoComplete="url" value={website} onChange={(e) => update(setWebsite, e.target.value)} placeholder="example.com" />
          </Field>
          <Field label="LinkedIn">
            <Input name="linkedin" type="url" value={linkedinUrl} onChange={(e) => update(setLinkedinUrl, e.target.value)} placeholder="linkedin.com/in/..." />
          </Field>
          <Field label="GitHub">
            <Input name="github" type="url" value={githubUrl} onChange={(e) => update(setGithubUrl, e.target.value)} placeholder="github.com/..." />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Skills &amp; experience</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <Field label="Skills" hint="Add one skill at a time">
            <SkillsEditor skills={skills} onChange={(value) => update(setSkills, value)} />
          </Field>
          <Field label="Years of experience">
            <Input name="yearsExperience" type="number" min={0} max={60} value={years} onChange={(e) => update(setYears, e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Education</h2>
        <EducationEditor entries={education} onChange={(value) => update(setEducation, value)} />
      </Card>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Certifications</h2>
        <CertificationEditor entries={certifications} onChange={(value) => update(setCertifications, value)} />
      </Card>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Work Experience</h2>
        <ExperienceEditor entries={workExperience} onChange={(value) => update(setWorkExperience, value)} />
      </Card>

      <Card className="space-y-4 border-border p-5 shadow-none">
        <h2 className="font-display text-base font-semibold tracking-tight">Job preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target roles" hint="Separate with commas">
            <Input name="targetRoles" value={targetRoles} onChange={(e) => update(setTargetRoles, e.target.value)} />
          </Field>
          <Field label="Preferred locations" hint="Separate with commas">
            <Input name="preferredLocations" value={preferredLocations} onChange={(e) => update(setPreferredLocations, e.target.value)} />
          </Field>
        </div>
        <Field label="Employment type">
          <CheckGroup options={JOB_TYPE_OPTIONS} selected={jobTypes} onChange={(value) => update(setJobTypes, value)} />
        </Field>
        <Field label="Work mode">
          <CheckGroup options={WORK_MODE_OPTIONS} selected={workModes} onChange={(value) => update(setWorkModes, value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Expected salary (min)">
            <Input name="salaryMin" type="number" min={0} value={salaryMin} onChange={(e) => update(setSalaryMin, e.target.value)} />
          </Field>
          <Field label="Expected salary (max)">
            <Input name="salaryMax" type="number" min={0} value={salaryMax} onChange={(e) => update(setSalaryMax, e.target.value)} />
          </Field>
          <Field label="Currency" hint="3-letter code, e.g. USD, KES">
            <Input name="salaryCurrency" autoComplete="off" value={currency} onChange={(e) => update(setCurrency, e.target.value.toUpperCase())} maxLength={3} />
          </Field>
        </div>
      </Card>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Save changes
        </Button>
        {status && (
          <p role="status" aria-live="polite" className={`text-xs ${status.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

const SettingsPage = () => {
  const { profile, isLoading, refresh } = useProfile();

  // The form is seeded once from the loaded profile, so make sure that's the
  // server's current copy (not a cache from earlier) before showing it -
  // otherwise saving could overwrite changes made from another device.
  const [fresh, setFresh] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void refresh()
      .then(() => {
        if (active) {
          setFresh(true);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (active) setLoadError(getApiErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  if (isLoading || !fresh) {
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-muted/40" />;
  }
  if (loadError || !profile) {
    return (
      <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
        {loadError ?? "We couldn&apos;t load your profile. Please refresh the page."}
      </p>
    );
  }
  return <SettingsForm key={`${profile.name}:${profile.email}`} initial={profile} />;
};

export default SettingsPage;
