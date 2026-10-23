"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Replace, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/components/shared/resources/format";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  ATTACHMENT_MIME_TYPES,
  COVER_IMAGE_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_COVER_IMAGE_BYTES,
  type StoredFile,
} from "@/lib/resources/constants";
import { adminResourcesService } from "./services/adminResources.client";

const SPEC = {
  cover: {
    mimes: COVER_IMAGE_MIME_TYPES as readonly string[],
    max: MAX_COVER_IMAGE_BYTES,
    accept: ".png,.jpg,.jpeg,.webp",
    hint: "PNG, JPG or WebP, up to 5 MB",
    typeError: "Cover image must be a PNG, JPG or WebP image.",
  },
  attachment: {
    mimes: ATTACHMENT_MIME_TYPES as readonly string[],
    max: MAX_ATTACHMENT_BYTES,
    accept: ".pdf,.doc,.docx",
    hint: "PDF, DOC or DOCX, up to 3 MB",
    typeError: "Attachment must be a PDF, DOC or DOCX file.",
  },
} as const;

/**
 * Uploads to Cloudinary via the admin upload endpoint as soon as a file is
 * chosen. `onUploaded` / `onRemoved` let the form track files that haven't
 * been saved yet so abandoned uploads can be discarded.
 */
export default function FileUploadField({
  kind,
  value,
  onChange,
  onUploaded,
  onRemoved,
  error,
}: {
  kind: "cover" | "attachment";
  value: StoredFile | null;
  onChange: (file: StoredFile | null) => void;
  onUploaded: (file: StoredFile) => void;
  onRemoved: (file: StoredFile) => void;
  error?: string;
}) {
  const spec = SPEC[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const typeOk = spec.mimes.includes(file.type) || (!file.type && spec.accept.includes(`.${ext}`));
    if (!typeOk) return setLocalError(spec.typeError);
    if (file.size === 0) return setLocalError("The file is empty.");
    if (file.size > spec.max) return setLocalError(`File is too large. ${spec.hint}.`);

    setBusy(true);
    try {
      const uploaded = await adminResourcesService.upload(file, kind);
      if (value) onRemoved(value); // replaced: the form decides whether to discard or defer to save
      onUploaded(uploaded);
      onChange(uploaded);
      toast.success(kind === "cover" ? "Cover image uploaded" : "Attachment uploaded");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setLocalError(message);
      toast.error(message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shownError = localError ?? error;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={spec.accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={kind === "cover" ? "Cover image file" : "Attachment file"}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {kind === "cover" ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset
            <img src={value.url} alt="Cover preview" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex items-center gap-3 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{value.originalFilename}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 border-t border-border p-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="animate-spin" /> : <Replace />}
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              className="text-destructive hover:text-destructive"
              onClick={() => {
                onRemoved(value);
                onChange(null);
              }}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : kind === "cover" ? (
            <ImageIcon className="size-5 text-primary" />
          ) : (
            <UploadCloud className="size-5 text-primary" />
          )}
          <span className="text-sm font-medium">{busy ? "Uploading…" : kind === "cover" ? "Upload cover image" : "Upload attachment"}</span>
          <span className="text-xs text-muted-foreground">{spec.hint}</span>
        </button>
      )}

      {shownError && (
        <p role="alert" className="text-xs text-destructive">
          {shownError}
        </p>
      )}
    </div>
  );
}
