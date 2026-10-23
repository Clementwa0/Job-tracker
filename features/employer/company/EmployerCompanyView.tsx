"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompanyPayload, EmployerCompany } from "@/types/employer";
import { employerService } from "@/features/employer/services/employer.client";
import { getApiErrorMessage } from "@/lib/apiError";

// Mirrors COMPANY_LIMITS in lib/jobPostings/validation.ts (the server is the
// source of truth; this just gives instant feedback).
const NAME_MIN = 2;
const NAME_MAX = 120;
const ABOUT_MAX = 2000;

function validateCompany(form: CompanyPayload): Partial<Record<keyof CompanyPayload, string>> {
  const errors: Partial<Record<keyof CompanyPayload, string>> = {};
  const name = (form.name ?? "").trim();
  if (name.length < NAME_MIN) errors.name = `Company name must be at least ${NAME_MIN} characters.`;
  else if (name.length > NAME_MAX) errors.name = `Company name must be ${NAME_MAX} characters or fewer.`;
  const website = (form.website ?? "").trim();
  if (website) {
    try {
      const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(website) ? website : `https://${website}`);
      if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) throw new Error();
    } catch {
      errors.website = "Enter a valid website, for example https://example.com.";
    }
  }
  if ((form.description ?? "").length > ABOUT_MAX) errors.description = `About must be ${ABOUT_MAX} characters or fewer.`;
  return errors;
}

const STATUS_STYLES: Record<EmployerCompany["status"], string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  suspended: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

export default function EmployerCompanyView() {
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [form, setForm] = useState<CompanyPayload>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyPayload, string>>>({});
  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    employerService
      .getCompany()
      .then((value) => { setCompany(value); setForm(value); })
      .catch((err) => {
        // 404 just means "no company yet" - anything else is a real failure.
        if (axios.isAxiosError(err) && err.response?.status === 404) setCompany(null);
        else setLoadError(getApiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);
  const dirty = !!company && JSON.stringify(form) !== JSON.stringify({ name: company.name, description: company.description, website: company.website, location: company.location, industry: company.industry });

  const handleSave = async () => {
    const found = validateCompany(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try { const updated = company ? await employerService.updateCompany(form) : await employerService.createCompany(form); setCompany(updated); setForm(updated); toast.success("Company profile saved."); }
    catch (err) { toast.error(getApiErrorMessage(err) || "Couldn't save your company profile."); } finally { setSaving(false); }
  };

  const handleReset = () => { if (company) setForm(company); setErrors({}); };

  if (loading) return <div className="py-12 text-sm text-muted-foreground">Loading company profile…</div>;

  if (loadError) {
    return (
      <div role="alert" className="mx-auto flex max-w-3xl flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">We couldn&apos;t load your company profile</p>
        <p className="max-w-sm text-xs text-muted-foreground">{loadError}</p>
        <Button size="sm" variant="outline" onClick={load}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <Link
          href="/employer/dashboard"
          className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Company Profile
          </h1>
          <Badge variant="secondary" className={cn("capitalize font-normal", company ? STATUS_STYLES[company.status] : "bg-muted text-muted-foreground")}>
            {company?.status ?? "not set up"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Company details</CardTitle>
          </div>
          <CardDescription>
            Shown on your job postings and to candidates browsing your listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                aria-invalid={!!errors.name}
                maxLength={NAME_MAX}
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                value={form.industry ?? ""}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-location">Location</Label>
              <Input
                id="company-location"
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-website">Website</Label>
              <Input
                id="company-website"
                type="text"
                inputMode="url"
                placeholder="https://example.com"
                aria-invalid={!!errors.website}
                value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-description">About</Label>
            <Textarea
              id="company-description"
              rows={4}
              placeholder="Tell candidates what your company does…"
              value={form.description ?? ""}
              maxLength={ABOUT_MAX}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {(form.description ?? "").length}/{ABOUT_MAX}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving || (!!company && !dirty)}>
              {company ? "Save changes" : "Create company profile"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} disabled={!dirty}>
              Discard changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
