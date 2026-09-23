"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FilePlus2, Copy, Trash2, Pencil, Search, FileText, MoreVertical, Check, X } from "lucide-react";
import { useResumesIndex } from "@/features/jobseeker/resumes/hooks/useResumes";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ResumeImportPanel } from "./components";

export default function ResumesDashboard() {
  const { items, createBlank, createFromData, duplicate, rename, remove } = useResumesIndex();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((m) => m.name.toLowerCase().includes(q));
  }, [items, query]);

  const newBlank = async () => {
    const meta = await createBlank("Untitled resume");
    if (meta) router.push(`/jobseeker/resumes/${meta.id}`);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      rename(id, editName.trim());
      toast({ title: "Renamed", description: "Your resume name was updated." });
    }
    setEditingId(null);
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Resumes</h1>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
              Create, tailor, and version multiple ATS-friendly resumes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resumes..."
                aria-label="Search resumes"
                className="pl-9 h-10 text-sm bg-card border-border shadow-xs"
              />
            </div>
            <Button onClick={newBlank} size="sm" className="h-10 font-medium text-sm gap-1.5 shadow-xs shrink-0">
              <Plus className="h-4 w-4 stroke-[2.5]" /> New Resume
            </Button>
          </div>
        </header>

        {/* Import panel */}
        <div className="rounded-2xl border border-border/80 bg-card/40 p-1 shadow-xs bg-card/30 backdrop-blur-xs">
          <ResumeImportPanel
            onParsed={async (resume, meta) => {
              const created = await createFromData(resume, meta.fileName.replace(/\.[^.]+$/, ""));
              if (created) router.push(`/jobseeker/resumes/${created.id}`);
            }}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState onCreate={newBlank} isSearchFiltered={!!query} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <article
                key={m.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-muted-foreground/40 hover:shadow-md"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Card body */}
                    {editingId === m.id ? (
                      <div
                        className="flex items-center gap-1.5 flex-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground bg-card">
                          <FileText className="h-5 w-5" />
                        </div>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-10 text-sm px-2"
                          autoFocus
                          aria-label="Resume name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(m.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Save name"
                          className="h-10 w-10 text-emerald-600"
                          onClick={() => handleSaveRename(m.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Cancel rename"
                          className="h-10 w-10 text-destructive"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Link href={`/jobseeker/resumes/${m.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                            {m.name}
                          </h3>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                            Updated {new Date(m.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Row actions */}
                    {editingId !== m.id && (
                      <div className="shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`More actions for ${m.name}`}
                                className="h-10 w-10 text-muted-foreground hover:text-foreground dark:text-muted-foreground"
                              />
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleStartRename(m.id, m.name)} className="text-sm cursor-pointer gap-2">
                              <Pencil className="h-4 w-4 text-muted-foreground" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const created = await duplicate(m.id);
                                if (created) toast({ title: "Duplicated", description: `Created copy: ${created.name}` });
                              }}
                              className="text-sm cursor-pointer gap-2"
                            >
                              <Copy className="h-4 w-4 text-muted-foreground" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                              className="text-sm cursor-pointer text-destructive focus:bg-destructive/10 gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3 border-border/50 flex items-center justify-end">
                  <Link href={`/jobseeker/resumes/${m.id}`} className="text-xs font-semibold text-primary hover:underline">
                    Open builder →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be removed. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) await remove(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EmptyStateProps {
  onCreate: () => void;
  isSearchFiltered: boolean;
}

function EmptyState({ onCreate, isSearchFiltered }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-xs max-w-md mx-auto my-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground bg-card dark:text-muted-foreground">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {isSearchFiltered ? "No resumes match your search" : "No resumes yet"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground max-w-xs mx-auto leading-normal">
        {isSearchFiltered
          ? "Try a different search, or clear the box to see everything."
          : "Start a blank resume or import an existing one to get going."}
      </p>
      {!isSearchFiltered && (
        <Button onClick={onCreate} size="sm" className="mt-5 h-10 font-medium text-sm gap-1.5">
          <Plus className="h-4 w-4 stroke-[2.5]" /> Create your first resume
        </Button>
      )}
    </div>
  );
}