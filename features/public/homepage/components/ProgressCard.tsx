import { CheckCircle2, Circle } from "lucide-react";
import { PreviewBadge } from "./Jobcard";

const steps = ["Profile optimized", "Application submitted", "Interview scheduled"];

export default function ProgressCard() {
  const completed = 2;
  return (
    <div className="absolute -bottom-4 left-[64%] hidden w-[200px] rounded-lg border border-border bg-card p-3 text-card-foreground shadow-[0_6px_16px_rgba(23,40,80,.1)] xl:block">
      <PreviewBadge />
      <b className="text-[11px]">Application progress</b>
      <p className="text-[11px] text-muted-foreground">{completed} of {steps.length}</p>
      <div className="mt-2 h-1 rounded bg-muted">
        <div className="h-full rounded bg-primary" style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      {steps.map((step, i) => (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground" key={step}>
          {i < completed
            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            : <Circle className={`h-3.5 w-3.5 shrink-0 ${i === completed ? "text-primary" : "text-muted-foreground/50"}`} />}
          <span className="truncate">{step}</span>
        </div>
      ))}
    </div>
  );
}