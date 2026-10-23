"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/dashboard/PageHeader";
import { AdminErrorState } from "@/features/admin/components/AdminListStates";
import { getApiErrorMessage } from "@/lib/apiError";
import type { ResourceCategory } from "@/types/resource";
import { adminResourcesService, getFieldErrors } from "./services/adminResources.client";

type Editing = { mode: "create" } | { mode: "edit"; category: ResourceCategory };

function CategoryForm({
  editing,
  onClose,
  onSaved,
}: {
  editing: Editing;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initial = editing.mode === "edit" ? editing.category : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return setErrors({ name: "Name must be at least 2 characters." });

    setSaving(true);
    try {
      const input = { name: trimmed, description: description.trim(), isActive };
      if (editing.mode === "create") await adminResourcesService.createCategory(input);
      else await adminResourcesService.updateCategory(editing.category.id, input);
      toast.success(editing.mode === "create" ? "Category created" : "Category updated");
      onSaved();
      onClose();
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <DialogHeader>
        <DialogTitle>{editing.mode === "edit" ? "Edit category" : "New category"}</DialogTitle>
        <DialogDescription>Categories group resources and appear as filters in the public library.</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors({});
          }}
          maxLength={60}
          autoFocus
          aria-invalid={!!errors.name || undefined}
        />
        {errors.name && (
          <p role="alert" className="text-xs text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category-description">Description (optional)</Label>
        <Textarea id="category-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={200} />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <Label htmlFor="category-active">Enabled</Label>
          <p className="text-xs text-muted-foreground">Disabled categories are hidden from public filters and can&apos;t be picked for new resources.</p>
        </div>
        <Switch id="category-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {editing.mode === "edit" ? "Save changes" : "Create category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function CategoryDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Editing | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={!!editing} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {editing && (
          <CategoryForm
            key={editing.mode === "edit" ? editing.category.id : "new"}
            editing={editing}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCategoriesView() {
  const [categories, setCategories] = useState<ResourceCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [toDelete, setToDelete] = useState<ResourceCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const [reloadTick, setReloadTick] = useState(0);
  const load = useCallback(() => setReloadTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    adminResourcesService
      .listCategories()
      .then((list) => {
        if (cancelled) return;
        setCategories(list);
        setError(null);
      })
      .catch((err) => !cancelled && setError(getApiErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const toggleActive = async (c: ResourceCategory, next: boolean) => {
    setBusyId(c.id);
    // Optimistic: flip now, roll back by reloading if the request fails.
    setCategories((list) => list?.map((x) => (x.id === c.id ? { ...x, isActive: next } : x)) ?? null);
    try {
      await adminResourcesService.updateCategory(c.id, { isActive: next });
      toast.success(next ? "Category enabled" : "Category disabled");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      load();
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!categories) return;
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    const previous = categories;
    setCategories(next);
    setReordering(true);
    try {
      await adminResourcesService.reorderCategories(next.map((c) => c.id));
    } catch (err) {
      setCategories(previous);
      toast.error(getApiErrorMessage(err));
      load();
    } finally {
      setReordering(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminResourcesService.deleteCategory(toDelete.id);
      toast.success("Category deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource categories"
        description="Organise resources into categories. Use the arrows to change the order they appear in."
        actions={
          <>
            <Button variant="ghost" nativeButton={false} render={<Link href="/admin/resources" />}>
              <ArrowLeft />
              Resources
            </Button>
            <Button onClick={() => setEditing({ mode: "create" })}>
              <Plus />
              New category
            </Button>
          </>
        }
      />

      {error && !categories ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : !categories ? (
        <div className="space-y-2" role="status" aria-label="Loading categories">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <FolderTree className="size-10 text-muted-foreground/60" />
          <p className="font-medium">No categories yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Create a category before adding resources, e.g. “Resume tips” or “Interview prep”.</p>
          <Button onClick={() => setEditing({ mode: "create" })}>
            <Plus />
            New category
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {categories.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Move ${c.name} up`}
                  disabled={i === 0 || reordering}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Move ${c.name} down`}
                  disabled={i === categories.length - 1 || reordering}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown />
                </Button>
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{c.name}</p>
                  {!c.isActive && <Badge variant="outline">Disabled</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{c.description || "No description"}</p>
                <p className="text-xs text-muted-foreground">
                  {c.resourceCount} {c.resourceCount === 1 ? "resource" : "resources"}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Switch
                  checked={c.isActive}
                  disabled={busyId === c.id}
                  onCheckedChange={(v) => toggleActive(c, v)}
                  aria-label={`${c.isActive ? "Disable" : "Enable"} ${c.name}`}
                />
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${c.name}`} onClick={() => setEditing({ mode: "edit", category: c })}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${c.name}`}
                  disabled={c.resourceCount > 0}
                  title={c.resourceCount > 0 ? "In use: reassign or delete its resources first" : "Delete category"}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setToDelete(c)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CategoryDialog editing={editing} onClose={() => setEditing(null)} onSaved={load} />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>“{toDelete?.name}” will be permanently deleted. No resources use it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
