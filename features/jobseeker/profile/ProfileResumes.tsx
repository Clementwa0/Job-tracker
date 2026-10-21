"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { getApiErrorMessage } from "@/lib/apiError";
import type { ImportedResume } from "@/lib/resume/importGuard";

type ProfileResume = { id: string; originalFilename: string; size: number; uploadedAt: string };
export function ProfileResumes({ onImported }: { onImported: (resume: ImportedResume) => void }) {
  const [items, setItems] = useState<ProfileResume[]>([]);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    axiosInstance.get<{ data: ProfileResume[] }>("/profile/resumes")
      .then(({ data }) => { if (active) setItems(data.data); })
      .catch((err) => { if (active) setError(getApiErrorMessage(err)); });
    return () => { active = false; };
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > 3 * 1024 * 1024) {
      setError("Choose a PDF or DOCX file up to 3 MB."); return;
    }
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const { data: imported } = await axiosInstance.post<{ data: ImportedResume }>("/resumes/import", form, {
        headers: { "Content-Type": undefined },
      });
      onImported(imported.data);

      try {
        const { data } = await axiosInstance.post<{ data: ProfileResume }>("/profile/resumes", form, {
          headers: { "Content-Type": undefined },
        });
        setItems((current) => [data.data, ...current]);
      } catch (err) {
        setError(`Profile details were filled, but the resume could not be attached: ${getApiErrorMessage(err)}`);
      }
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this resume from your profile?")) return;
    setDeleting(id); setError("");
    try {
      await axiosInstance.delete(`/profile/resumes?id=${encodeURIComponent(id)}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setDeleting(null); }
  }
  return <Card className="space-y-4 border-border p-5 shadow-none">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-semibold">Fill profile from resume</h2><p className="text-sm text-muted-foreground">We’ll add readable details to the form for review and attach the source file. PDF or DOCX, maximum 3 MB.</p></div>
      <input ref={input} type="file" accept=".pdf,.docx" className="hidden" aria-label="Select resume" onChange={(e) => void upload(e.target.files?.[0])} />
      <Button type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <Upload />}{busy ? "Reading resume…" : "Upload resume"}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {items.length === 0 && <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>}
    <div className="space-y-2">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-2"><FileText className="shrink-0" /><div className="min-w-0"><p className="truncate text-sm font-medium">{item.originalFilename}</p><p className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(0)} KB · {new Date(item.uploadedAt).toLocaleDateString()}</p></div></div>
      <Button type="button" variant="ghost" size="sm" disabled={deleting === item.id} onClick={() => void remove(item.id)}>{deleting === item.id ? <Loader2 className="animate-spin" /> : <Trash2 />} Remove</Button>
    </div>)}</div>
  </Card>;
}
