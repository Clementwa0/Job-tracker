import { useState } from "react";
import { Trash2, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { Field, inputCls } from "./SectionCard";
import type { ResumeExperience } from "@/types/resume-builder";
import { aiService } from "@/services/aiService";
import { toast } from "@/hooks/use-toast";

interface Props {
  items: ResumeExperience[];
  update: (id: string, patch: Partial<ResumeExperience>) => void;
  remove: (id: string) => void;
}

export default function ExperienceEditor({ items, update, remove }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No experience yet. Add your first role.</p>;
  }
  return (
    <div className="space-y-4">
      {items.map((x) => (
        <ExperienceItem key={x.id} item={x} update={update} remove={remove} />
      ))}
    </div>
  );
}

function ExperienceItem({
  item,
  update,
  remove,
}: {
  item: ResumeExperience;
  update: (id: string, patch: Partial<ResumeExperience>) => void;
  remove: (id: string) => void;
}) {
  const setBullet = (i: number, v: string) => {
    const next = [...item.bullets];
    next[i] = v;
    update(item.id, { bullets: next });
  };
  const addBullet = () => update(item.id, { bullets: [...item.bullets, ""] });
  const removeBullet = (i: number) =>
    update(item.id, { bullets: item.bullets.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {item.role || "New role"} {item.company && <span className="text-gray-500">· {item.company}</span>}
        </p>
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="rounded p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          aria-label="Remove experience"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Role">
          <input
            className={inputCls}
            value={item.role}
            onChange={(e) => update(item.id, { role: e.target.value })}
            placeholder="Senior Software Engineer"
          />
        </Field>
        <Field label="Company">
          <input
            className={inputCls}
            value={item.company}
            onChange={(e) => update(item.id, { company: e.target.value })}
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="Location">
          <input
            className={inputCls}
            value={item.location}
            onChange={(e) => update(item.id, { location: e.target.value })}
            placeholder="Remote · NYC"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start">
            <input
              type="month"
              className={inputCls}
              value={item.startDate}
              onChange={(e) => update(item.id, { startDate: e.target.value })}
            />
          </Field>
          <Field label="End">
            <input
              type="month"
              className={inputCls}
              value={item.endDate}
              disabled={item.current}
              onChange={(e) => update(item.id, { endDate: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={item.current}
          onChange={(e) => update(item.id, { current: e.target.checked, endDate: e.target.checked ? "" : item.endDate })}
        />
        I currently work here
      </label>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Highlights
          </span>
          <button
            type="button"
            onClick={addBullet}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Plus className="h-3 w-3" /> Add bullet
          </button>
        </div>
        <ul className="space-y-2">
          {item.bullets.map((b, i) => (
            <BulletRow
              key={i}
              value={b}
              onChange={(v) => setBullet(i, v)}
              onRemove={() => removeBullet(i)}
              context={`${item.role} at ${item.company}`}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function BulletRow({
  value,
  onChange,
  onRemove,
  context,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  context: string;
}) {
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);

  const rewrite = async () => {
    if (!value.trim()) {
      toast({ title: "Write something first", description: "Enter a bullet to rewrite." });
      return;
    }
    setBusy(true);
    try {
      const { variants } = await aiService.rewriteBullet(value, context);
      setVariants(variants ?? []);
    } catch (err: any) {
      toast({ title: "Rewrite failed", description: err?.response?.data?.error ?? "Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li>
      <div className="flex items-start gap-2">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Shipped feature X that reduced load time by 35%…"
          className={inputCls + " resize-y"}
        />
        <button
          type="button"
          onClick={rewrite}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
          title="Rewrite with AI"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          AI
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:text-rose-500"
          aria-label="Remove bullet"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {variants.length > 0 && (
        <div className="mt-2 ml-1 space-y-1 rounded-md border border-dashed border-blue-200 dark:border-blue-900 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">AI suggestions</p>
          {variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(v);
                setVariants([]);
              }}
              className="block w-full text-left text-xs rounded px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-200"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
