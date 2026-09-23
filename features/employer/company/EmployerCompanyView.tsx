"use client";

import { useEffect, useState } from "react";
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
  useEffect(() => { employerService.getCompany().then((value) => { setCompany(value); setForm(value); }).catch(() => setCompany(null)).finally(() => setLoading(false)); }, []);
  const dirty = !!company && JSON.stringify(form) !== JSON.stringify({ name: company.name, description: company.description, website: company.website, location: company.location, industry: company.industry });

  const handleSave = async () => {
    setSaving(true);
    try { const updated = company ? await employerService.updateCompany(form) : await employerService.createCompany(form); setCompany(updated); setForm(updated); toast.success("Company profile saved."); }
    catch { toast.error("Couldn't save your company profile."); } finally { setSaving(false); }
  };

  const handleReset = () => company && setForm(company);

  if (loading) return <div className="py-12 text-sm text-muted-foreground">Loading company profile…</div>;

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
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
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
                type="url"
                value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-description">About</Label>
            <Textarea
              id="company-description"
              rows={4}
              placeholder="Tell candidates what your company does…"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
