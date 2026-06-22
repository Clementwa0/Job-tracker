import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FilePlus2, Copy, Trash2, Pencil, Search, FileText, MoreVertical, Check, X } from "lucide-react";
import { useResumesIndex } from "@/hooks/useResumes";
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
import ResumeImportPanel from "@/features/resume/ResumeImportPanel";

export default function ResumesDashboard() {
  const { items, createBlank, createFromData, duplicate, rename, remove } = useResumesIndex();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((m) => m.name.toLowerCase().includes(q));
  }, [items, query]);

  const newBlank = async () => {
    const meta = await createBlank("Untitled resume");
    if (meta) navigate(`/resume-builder/${meta.id}`);
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
    <div className="min-h-dvh bg-slate-50/50 text-slate-900 p-4 dark:bg-slate-950 dark:text-slate-50 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Resumes</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create, tailor, and version multiple ATS-friendly resumes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resumes..."
                aria-label="Search resumes"
                className="pl-9 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
              />
            </div>
            <Button onClick={newBlank} size="sm" className="h-10 font-medium text-sm gap-1.5 shadow-xs shrink-0">
              <Plus className="h-4 w-4 stroke-[2.5]" /> New Resume
            </Button>
          </div>
        </header>

        {/* Import panel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-1 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/30 backdrop-blur-xs">
          <ResumeImportPanel
            onParsed={async (resume, meta) => {
              const created = await createFromData(resume, meta.fileName.replace(/\.[^.]+$/, ""));
              if (created) navigate(`/resume-builder/${created.id}`);
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
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Card body */}
                    {editingId === m.id ? (
                      <div
                        className="flex items-center gap-1.5 flex-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
                      <Link to={`/resume-builder/${m.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-950">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                            {m.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Updated {new Date(m.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Row actions */}
                    {editingId !== m.id && (
                      <div className="shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`More actions for ${m.name}`}
                              className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleStartRename(m.id, m.name)} className="text-sm cursor-pointer gap-2">
                              <Pencil className="h-4 w-4 text-slate-500" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const created = await duplicate(m.id);
                                if (created) toast({ title: "Duplicated", description: `Created copy: ${created.name}` });
                              }}
                              className="text-sm cursor-pointer gap-2"
                            >
                              <Copy className="h-4 w-4 text-slate-500" /> Duplicate
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

                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/50 flex items-center justify-end">
                  <Link to={`/resume-builder/${m.id}`} className="text-xs font-semibold text-primary hover:underline">
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
              "{deleteTarget?.name}" will be removed. This can't be undone.
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs max-w-md mx-auto my-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {isSearchFiltered ? "No resumes match your search" : "No resumes yet"}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-normal">
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