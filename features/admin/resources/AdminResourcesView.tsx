"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Eye,
  ExternalLink,
  FileCheck2,
  FilePen,
  FolderTree,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Star,
  StarOff,
  Trash2,
  Undo2,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/dashboard/PageHeader";
import OptionSelect from "@/components/shared/resources/OptionSelect";
import { ResourceStatusBadge, ResourceTypeBadge } from "@/components/shared/resources/ResourceBadges";
import ResourceArticle from "@/components/shared/resources/ResourceArticle";
import { formatDate } from "@/components/shared/resources/format";
import AdminPagination from "@/features/admin/components/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "@/features/admin/components/AdminListStates";
import StatCard from "@/features/admin/components/StatCard";
import { useAdminPagination } from "@/features/admin/hooks/useAdminPagination";
import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/apiError";
import type { PaginatedMeta } from "@/types/admin";
import type { AdminResource, AdminResourceListItem, AdminResourceSummary, ResourceCategory } from "@/types/resource";
import { adminResourcesService } from "./services/adminResources.client";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 1 };
const EMPTY_SUMMARY: AdminResourceSummary = { total: 0, published: 0, draft: 0 };

export default function AdminResourcesView() {
  const router = useRouter();
  const { page, limit, setPage, setLimit, resetPage } = useAdminPagination();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const debouncedQ = useDebounce(q.trim(), 300);

  const [items, setItems] = useState<AdminResourceListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [summary, setSummary] = useState<AdminResourceSummary>(EMPTY_SUMMARY);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{ key: string; error: string | null } | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminResourceListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<{ loading: boolean; resource: AdminResource | null; title: string } | null>(null);

  // Changing a filter returns to page 1.
  const filterSig = `${debouncedQ}|${status}|${category}`;
  const lastSig = useRef(filterSig);
  useEffect(() => {
    if (lastSig.current !== filterSig) {
      lastSig.current = filterSig;
      resetPage();
    }
  }, [filterSig, resetPage]);

  const requestKey = `${page}|${limit}|${filterSig}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    adminResourcesService
      .list({
        page,
        limit,
        q: debouncedQ || undefined,
        status: status === "all" ? undefined : status,
        category: category === "all" ? undefined : category,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setMeta(res.meta);
        setSummary(res.summary);
        setSettled({ key: requestKey, error: null });
        if (res.items.length === 0 && res.meta.total > 0 && page > res.meta.totalPages) setPage(res.meta.totalPages);
      })
      .catch((err) => !cancelled && setSettled({ key: requestKey, error: getApiErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedQ, status, category, requestKey, setPage]);

  useEffect(() => {
    adminResourcesService.listCategories().then(setCategories).catch(() => undefined);
  }, []);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = settled?.key !== requestKey;
  const error = loading ? null : settled?.error ?? null;
  const initialLoad = loading && items.length === 0;
  const hasFilters = !!debouncedQ || status !== "all" || category !== "all";

  const categoryOptions = useMemo(
    () => [{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories],
  );

  const runAction = async (item: AdminResourceListItem, action: "publish" | "unpublish" | "feature" | "unfeature") => {
    setBusyId(item.id);
    const messages = {
      publish: "Resource published",
      unpublish: "Resource moved to drafts",
      feature: "Marked as featured",
      unfeature: "Removed from featured",
    };
    try {
      await adminResourcesService.action(item.id, action);
      toast.success(messages[action]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminResourcesService.remove(toDelete.id);
      toast.success("Resource deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
      reload();
    }
  };

  const openPreview = async (item: AdminResourceListItem) => {
    setPreview({ loading: true, resource: null, title: item.title });
    try {
      setPreview({ loading: false, resource: await adminResourcesService.get(item.id), title: item.title });
    } catch (err) {
      setPreview(null);
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Create and manage the career guides, templates and checklists shown to jobseekers."
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/resources/categories" />}>
              <FolderTree />
              Categories
            </Button>
            <Button nativeButton={false} render={<Link href="/admin/resources/new" />}>
              <Plus />
              New resource
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Total resources" value={summary.total} icon={BookOpen} accent="blue" description="All drafts and published" />
        <StatCard title="Published" value={summary.published} icon={FileCheck2} accent="green" description="Visible to the public" />
        <StatCard title="Drafts" value={summary.draft} icon={FilePen} accent="amber" description="Not yet published" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            aria-label="Search resources"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
        <OptionSelect aria-label="Filter by status" value={status} onChange={setStatus} options={STATUS_OPTIONS} className="sm:w-44" />
        <OptionSelect aria-label="Filter by category" value={category} onChange={setCategory} options={categoryOptions} className="sm:w-52" />
      </div>

      {error && items.length === 0 ? (
        <AdminErrorState message={error} onRetry={reload} />
      ) : initialLoad ? (
        <AdminTableSkeleton cols={6} />
      ) : items.length === 0 ? (
        hasFilters ? (
          <AdminEmptyState title="No resources match your filters" description="Try a different search term, status or category." />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <BookOpen className="size-10 text-muted-foreground/60" />
            <p className="font-medium">No resources yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create a category, then write your first guide, template or checklist.
            </p>
            <Button nativeButton={false} render={<Link href="/admin/resources/new" />}>
              <Plus />
              New resource
            </Button>
          </div>
        )
      ) : (
        <>
          <div className={`overflow-x-auto rounded-xl border border-border bg-card transition-opacity ${loading ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="max-w-[22rem] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/resources/${item.id}/edit`} className="truncate font-medium hover:underline">
                          {item.title}
                        </Link>
                        {item.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-500" aria-label="Featured" />}
                      </div>
                      <p className="truncate font-mono text-xs text-muted-foreground">/{item.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <ResourceTypeBadge type={item.type} />
                    </td>
                    <td className="px-4 py-3">
                      <ResourceStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${item.title}`} disabled={busyId === item.id} />
                          }
                        >
                          {busyId === item.id ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/admin/resources/${item.id}/edit`)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPreview(item)}>
                            <Eye /> Preview
                          </DropdownMenuItem>
                          {item.status === "published" && (
                            <DropdownMenuItem onClick={() => window.open(`/resources/${item.slug}`, "_blank", "noopener")}>
                              <ExternalLink /> View live
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {item.status === "published" ? (
                            <DropdownMenuItem onClick={() => runAction(item, "unpublish")}>
                              <Undo2 /> Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => runAction(item, "publish")}>
                              <Send /> Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => runAction(item, item.featured ? "unfeature" : "feature")}>
                            {item.featured ? <StarOff /> : <Star />}
                            {item.featured ? "Remove from featured" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setToDelete(item)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination meta={meta} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} loading={loading} />
        </>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” will be permanently deleted, along with its uploaded files and any jobseeker bookmarks. This can&apos;t be undone.
            </AlertDialogDescription>
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

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>{preview?.title}</DialogDescription>
          </DialogHeader>
          {preview?.loading || !preview?.resource ? (
            <div className="flex justify-center py-16" role="status">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading preview" />
            </div>
          ) : (
            <ResourceArticle
              data={{
                title: preview.resource.title,
                description: preview.resource.description,
                type: preview.resource.type,
                categoryName: preview.resource.category?.name,
                coverImageUrl: preview.resource.coverImage?.url,
                html: preview.resource.content,
                tags: preview.resource.tags,
                publishedAt: preview.resource.publishedAt,
                attachment: preview.resource.attachment,
                externalUrl: preview.resource.externalUrl,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
