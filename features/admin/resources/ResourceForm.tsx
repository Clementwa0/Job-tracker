"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink, Loader2, Save, Send, Undo2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/dashboard/PageHeader";
import OptionSelect from "@/components/shared/resources/OptionSelect";
import ResourceArticle from "@/components/shared/resources/ResourceArticle";
import { AdminErrorState } from "@/features/admin/components/AdminListStates";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type ResourceStatus,
  type ResourceType,
  type StoredFile,
} from "@/lib/resources/constants";
import { fieldErrors, publishIssues, resourceInputSchema } from "@/lib/resources/schema";
import { slugify } from "@/lib/resources/slug";
import type { AdminResource, ResourceCategory } from "@/types/resource";
import FileUploadField from "./FileUploadField";
import TiptapEditor from "./TiptapEditor";
import { adminResourcesService, getFieldErrors, type ResourcePayload } from "./services/adminResources.client";

interface FormState {
  title: string;
  description: string;
  categoryId: string;
  type: ResourceType;
  content: string;
  coverImage: StoredFile | null;
  attachment: StoredFile | null;
  externalUrl: string;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: FormState = {
  title: "",
  description: "",
  categoryId: "",
  type: "article",
  content: "",
  coverImage: null,
  attachment: null,
  externalUrl: "",
  tags: [],
  featured: false,
  seoTitle: "",
  seoDescription: "",
};

const fromResource = (r: AdminResource): FormState => ({
  title: r.title,
  description: r.description,
  categoryId: r.categoryId,
  type: r.type,
  content: r.content,
  coverImage: r.coverImage,
  attachment: r.attachment,
  externalUrl: r.externalUrl ?? "",
  tags: r.tags,
  featured: r.featured,
  seoTitle: r.seoTitle,
  seoDescription: r.seoDescription,
});

const TYPE_OPTIONS = RESOURCE_TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t] }));

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function TagInput({ value, onChange, error }: { value: string[]; onChange: (tags: string[]) => void; error?: string }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const next = draft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setDraft("");
    if (!next.length) return;
    const seen = new Set(value.map((t) => t.toLowerCase()));
    const merged = [...value];
    for (const tag of next) {
      if (!seen.has(tag.toLowerCase())) {
        seen.add(tag.toLowerCase());
        merged.push(tag);
      }
    }
    onChange(merged);
  };

  return (
    <div className="space-y-2">
      <Input
        id="resource-tags"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder="Type a tag and press Enter"
        aria-invalid={!!error || undefined}
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ResourceForm({ resourceId }: { resourceId?: string }) {
  const router = useRouter();
  const isEdit = !!resourceId;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [initial, setInitial] = useState<AdminResource | null>(null);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  // The request key of the last load that finished; `loading` is derived from it.
  const [loaded, setLoaded] = useState<{ key: string; error: string | null } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<ResourceStatus | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Files uploaded in this session but not saved yet - discarded if abandoned.
  const unsaved = useRef(new Map<string, StoredFile>());
  const saved = useRef(false);

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (key in e ? Object.fromEntries(Object.entries(e).filter(([k]) => k !== key)) : e));
  }, []);

  const loadKey = `${resourceId ?? "new"}|${attempt}`;
  const loading = loaded?.key !== loadKey;
  const loadError = loading ? null : (loaded?.error ?? null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminResourcesService.listCategories(), resourceId ? adminResourcesService.get(resourceId) : null])
      .then(([cats, resource]) => {
        if (cancelled) return;
        setCategories(cats);
        if (resource) {
          setInitial(resource);
          setForm(fromResource(resource));
        }
        setLoaded({ key: loadKey, error: null });
      })
      .catch((err) => !cancelled && setLoaded({ key: loadKey, error: getApiErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [resourceId, loadKey]);

  // Leaving without saving: drop files that were uploaded but never attached.
  useEffect(() => {
    const files = unsaved.current;
    return () => {
      if (saved.current) return;
      for (const file of files.values()) void adminResourcesService.discardUpload(file.url);
    };
  }, []);

  const trackUpload = useCallback((file: StoredFile) => void unsaved.current.set(file.url, file), []);
  const trackRemoval = useCallback((file: StoredFile) => {
    // Unsaved file: delete it now. Saved file: the server removes it when this form is saved.
    if (unsaved.current.delete(file.url)) void adminResourcesService.discardUpload(file.url);
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.isActive || c.id === form.categoryId)
        .map((c) => ({ value: c.id, label: c.isActive ? c.name : `${c.name} (disabled)` })),
    [categories, form.categoryId],
  );
  const categoryName = categories.find((c) => c.id === form.categoryId)?.name ?? null;
  const slugPreview = initial?.slug ?? slugify(form.title || "your-title");

  const buildPayload = (status: ResourceStatus): ResourcePayload =>
    ({ ...form, externalUrl: form.externalUrl.trim() || null, status }) as unknown as ResourcePayload;

  const submit = async (status: ResourceStatus) => {
    const payload = buildPayload(status);
    const parsed = resourceInputSchema.safeParse(payload);
    const found: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);
    if (status === "published") {
      Object.assign(
        found,
        publishIssues({
          description: form.description,
          content: form.content,
          attachment: form.attachment,
          externalUrl: form.externalUrl.trim() || null,
          hasContent: form.content.trim().length > 0,
        }),
      );
    }
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error(status === "published" ? "Complete the highlighted fields to publish." : "Fix the highlighted fields to save.");
      document.getElementById("resource-form-errors")?.focus();
      return;
    }

    setSaving(status);
    setErrors({});
    try {
      const result = isEdit
        ? await adminResourcesService.update(resourceId as string, payload)
        : await adminResourcesService.create(payload);
      saved.current = true;
      unsaved.current.clear();

      if (isEdit) {
        setInitial(result);
        setForm(fromResource(result));
        saved.current = false; // still on the page: new uploads should be tracked again
        toast.success(status === "published" ? (initial?.status === "published" ? "Changes saved" : "Resource published") : initial?.status === "published" ? "Resource unpublished and saved as draft" : "Draft saved");
      } else if (status === "published") {
        toast.success("Resource published");
        router.push("/admin/resources");
      } else {
        toast.success("Draft saved");
        router.replace(`/admin/resources/${result.id}/edit`);
      }
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground" role="status">
        <Loader2 className="size-6 animate-spin" aria-label="Loading resource" />
      </div>
    );
  }
  if (loadError) {
    return <AdminErrorState message={loadError} onRetry={() => setAttempt((n) => n + 1)} />;
  }

  const isPublished = initial?.status === "published";
  const busy = saving !== null;
  const errorList = Object.entries(errors);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit resource" : "New resource"}
        description={isEdit ? `Last updated ${new Date(initial!.updatedAt).toLocaleString()}` : "Write a guide, template or checklist for jobseekers."}
        actions={
          <>
            <Button variant="ghost" nativeButton={false} render={<Link href="/admin/resources" />}>
              <ArrowLeft />
              Back
            </Button>
            {isPublished && (
              <Button variant="outline" nativeButton={false} render={<Link href={`/resources/${initial!.slug}`} target="_blank" />}>
                <ExternalLink />
                View live
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye />
              Preview
            </Button>
            {isPublished ? (
              <>
                <Button variant="outline" disabled={busy} onClick={() => submit("draft")}>
                  {saving === "draft" ? <Loader2 className="animate-spin" /> : <Undo2 />}
                  Unpublish
                </Button>
                <Button disabled={busy} onClick={() => submit("published")}>
                  {saving === "published" ? <Loader2 className="animate-spin" /> : <Save />}
                  Save changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" disabled={busy} onClick={() => submit("draft")}>
                  {saving === "draft" ? <Loader2 className="animate-spin" /> : <Save />}
                  Save draft
                </Button>
                <Button disabled={busy} onClick={() => submit("published")}>
                  {saving === "published" ? <Loader2 className="animate-spin" /> : <Send />}
                  Publish
                </Button>
              </>
            )}
          </>
        }
      />

      {errorList.length > 0 && (
        <div
          id="resource-form-errors"
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive focus:outline-none"
        >
          <p className="font-medium">Please fix {errorList.length === 1 ? "this issue" : `these ${errorList.length} issues`}:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorList.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5">
              <Field label="Title" htmlFor="resource-title" error={errors.title}>
                <Input
                  id="resource-title"
                  value={form.title}
                  onChange={(e) => patch("title", e.target.value)}
                  placeholder="e.g. How to tailor your CV to a job description"
                  maxLength={150}
                  aria-invalid={!!errors.title || undefined}
                />
                <p className="text-xs text-muted-foreground">
                  URL: <span className="font-mono">/resources/{slugPreview}</span>
                  {!isEdit && " (made unique automatically)"}
                </p>
              </Field>

              <Field
                label="Short description"
                htmlFor="resource-description"
                error={errors.description}
                hint={`${form.description.length}/300 · shown on resource cards. Required to publish.`}
              >
                <Textarea
                  id="resource-description"
                  value={form.description}
                  onChange={(e) => patch("description", e.target.value)}
                  rows={3}
                  maxLength={300}
                  aria-invalid={!!errors.description || undefined}
                />
              </Field>

              <Field label="Content" error={errors.content}>
                <TiptapEditor value={form.content} onChange={(html) => patch("content", html)} invalid={!!errors.content} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field
                label="SEO title"
                htmlFor="resource-seo-title"
                error={errors.seoTitle}
                hint={`${form.seoTitle.length}/70 · defaults to the resource title.`}
              >
                <Input id="resource-seo-title" value={form.seoTitle} onChange={(e) => patch("seoTitle", e.target.value)} maxLength={70} />
              </Field>
              <Field
                label="SEO description"
                htmlFor="resource-seo-description"
                error={errors.seoDescription}
                hint={`${form.seoDescription.length}/160 · defaults to the short description.`}
              >
                <Textarea
                  id="resource-seo-description"
                  value={form.seoDescription}
                  onChange={(e) => patch("seoDescription", e.target.value)}
                  rows={2}
                  maxLength={160}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Category" htmlFor="resource-category" error={errors.categoryId}>
                <OptionSelect
                  id="resource-category"
                  value={form.categoryId}
                  onChange={(v) => patch("categoryId", v)}
                  options={categoryOptions}
                  placeholder={categoryOptions.length ? "Select a category" : "No categories yet"}
                  invalid={!!errors.categoryId}
                  className="w-full"
                />
                {categories.length === 0 && (
                  <Link href="/admin/resources/categories" className="text-xs font-medium text-primary hover:underline">
                    Create your first category
                  </Link>
                )}
              </Field>

              <Field label="Type" htmlFor="resource-type" error={errors.type}>
                <OptionSelect
                  id="resource-type"
                  value={form.type}
                  onChange={(v) => patch("type", v as ResourceType)}
                  options={TYPE_OPTIONS}
                  className="w-full"
                />
              </Field>

              <Field label="Tags" htmlFor="resource-tags" error={errors.tags} hint="Up to 10. Used for search and related resources.">
                <TagInput value={form.tags} onChange={(tags) => patch("tags", tags)} error={errors.tags} />
              </Field>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="resource-featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Highlight in the featured section.</p>
                </div>
                <Switch id="resource-featured" checked={form.featured} onCheckedChange={(v) => patch("featured", v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadField
                kind="cover"
                value={form.coverImage}
                onChange={(f) => patch("coverImage", f)}
                onUploaded={trackUpload}
                onRemoved={trackRemoval}
                error={errors.coverImage}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachment &amp; link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Downloadable file (optional)" error={errors.attachment}>
                <FileUploadField
                  kind="attachment"
                  value={form.attachment}
                  onChange={(f) => patch("attachment", f)}
                  onUploaded={trackUpload}
                  onRemoved={trackRemoval}
                  error={errors.attachment}
                />
              </Field>
              <Field label="External URL (optional)" htmlFor="resource-url" error={errors.externalUrl}>
                <Input
                  id="resource-url"
                  type="url"
                  inputMode="url"
                  value={form.externalUrl}
                  onChange={(e) => patch("externalUrl", e.target.value)}
                  placeholder="https://"
                  aria-invalid={!!errors.externalUrl || undefined}
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>How this resource will look to readers. Nothing is saved or published.</DialogDescription>
          </DialogHeader>
          <ResourceArticle
            data={{
              title: form.title,
              description: form.description,
              type: form.type,
              categoryName,
              coverImageUrl: form.coverImage?.url,
              html: form.content,
              tags: form.tags,
              attachment: form.attachment,
              externalUrl: form.externalUrl.trim() || null,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
