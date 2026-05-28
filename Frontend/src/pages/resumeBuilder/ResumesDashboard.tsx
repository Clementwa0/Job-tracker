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
import ResumeImportPanel from "@/features/resume/ResumeImportPanel";

export default function ResumesDashboard() {
  const { items, createBlank, createFromData, duplicate, rename, remove } = useResumesIndex();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((m) => m.name.toLowerCase().includes(q));
  }, [items, query]);

  const newBlank = () => {
    const meta = createBlank("Untitled resume");
    navigate(`/resume-builder/${meta.id}`);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      rename(id, editName.trim());
      toast({ title: "Success", description: "Resume successfully renamed" });
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-4 dark:bg-slate-950 dark:text-slate-50 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Dashboard Header Panel */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Resumes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create, tailor and version multiple high-performance, ATS-friendly resumes.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
              />
            </div>
            <Button onClick={newBlank} size="sm" className="h-9 font-medium text-xs gap-1.5 shadow-xs shrink-0">
              <Plus className="h-4 w-4 stroke-[2.5]" /> New Resume
            </Button>
          </div>
        </header>

        {/* Workspace Central Operations Box */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/40 p-1 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/30 backdrop-blur-xs">
          <ResumeImportPanel
            onParsed={(resume, meta) => {
              const created = createFromData(resume, meta.fileName.replace(/\.[^.]+$/, ""));
              navigate(`/resume-builder/${created.id}`);
            }}
          />
        </div>

        {/* Content Body Grid Renderer */}
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
                    {/* Visual Artifact Descriptor */}
                    <Link to={`/resume-builder/${m.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-950">
                        <FileText className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-1.5 onClick={(e) => e.stopPropagation()}">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-xs px-2 py-0.5"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(m.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleSaveRename(m.id)}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600" onClick={() => setEditingId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                              {m.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Synced {new Date(m.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </>
                        )}
                      </div>
                    </Link>

                    {/* Integrated Shadcn Control Actions Flyout */}
                    <div className="shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-200">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleStartRename(m.id, m.name)} className="text-xs cursor-pointer gap-2">
                            <Pencil className="h-3.5 w-3.5 text-slate-400" /> Rename Document
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const created = duplicate(m.id);
                              if (created) toast({ title: "Duplicated", description: `Created copy: ${created.name}` });
                            }} 
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate Version
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm(`Are you completely sure you want to permanently discard "${m.name}"?`)) remove(m.id);
                            }} 
                            className="text-xs cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30 gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Micro CTA Prompt for scannability */}
                <div className="mt-4 border-t border-slate-50 pt-3 dark:border-slate-800/50 flex items-center justify-end">
                  <Link to={`/resume-builder/${m.id}`} className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Open Builder →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {isSearchFiltered ? "No search results matched" : "No resumes created yet"}
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-normal">
        {isSearchFiltered 
          ? "Check spelling parameters or clear the query filter rule to reveal all index items."
          : "Kickstart your applications workflow by spinning up a modular blank template canvas or importing a record below."}
      </p>
      {!isSearchFiltered && (
        <Button onClick={onCreate} size="sm" className="mt-5 font-medium text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Create Initial Template
        </Button>
      )}
    </div>
  );
}