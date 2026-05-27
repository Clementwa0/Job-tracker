import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FilePlus2, Copy, Trash2, Pencil, Search, FileText } from "lucide-react";
import { useResumesIndex } from "@/hooks/useResumes";
import { toast } from "@/hooks/use-toast";
import ResumeImportPanel from "@/features/resume/ResumeImportPanel";

export default function ResumesDashboard() {
  const { items, createBlank, createFromData, duplicate, rename, remove } = useResumesIndex();
  const [query, setQuery] = useState("");
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
            <p className="text-sm text-gray-500">Create, tailor and version multiple ATS-friendly resumes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resumes…"
                className="rounded-md border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
            <button
              type="button"
              onClick={newBlank}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> New resume
            </button>
          </div>
        </header>

        <ResumeImportPanel
          onParsed={(resume, meta) => {
            const created = createFromData(resume, meta.fileName.replace(/\.[^.]+$/, ""));
            navigate(`/resume-builder/${created.id}`);
          }}
        />

        {filtered.length === 0 ? (
          <EmptyState onCreate={newBlank} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <article
                key={m.id}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
              >
                <Link to={`/resume-builder/${m.id}`} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-[11px] text-gray-500">Updated {new Date(m.updatedAt).toLocaleString()}</p>
                  </div>
                </Link>
                <div className="mt-3 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt("Rename resume", m.name);
                      if (name && name.trim()) rename(m.id, name.trim());
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Pencil className="h-3 w-3" /> Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const created = duplicate(m.id);
                      if (created) toast({ title: "Duplicated", description: created.name });
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${m.name}"?`)) remove(m.id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-gray-800 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
      <FilePlus2 className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">No resumes yet</p>
      <p className="mt-1 text-xs text-gray-500">Start from scratch or import an existing PDF/DOCX above.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" /> Create your first resume
      </button>
    </div>
  );
}
