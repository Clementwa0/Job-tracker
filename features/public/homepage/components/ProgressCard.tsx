import { CheckCircle2, Circle } from "lucide-react";
import { PreviewBadge } from "./Jobcard";

const steps = [
  "Profile optimized",
  "Application submitted",
  "Interview scheduled",
  "Interview completed",
  "Offer received",
];

export default function ProgressCard() {
  const completed = 2;

  return (
    <div className="absolute -bottom-4 left-[64%] w-[215px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_6px_16px_rgba(23,40,80,.1)]">
      <PreviewBadge />
      <b className="text-[11px]">Application progress</b>
      <p className="text-[11px] text-[#697386]">
        {completed} of {steps.length} steps
      </p>
      <div className="mt-2 h-1 rounded bg-[#e8eefb]">
        <div
          className="h-full rounded bg-[#1d70ed]"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>
      {steps.map((step, i) => (
        <div
          className="mt-2 flex items-center gap-2 text-[11px] text-[#566175]"
          key={step}
        >
          {i < completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Circle
              className={`h-3.5 w-3.5 ${i === completed ? "text-[#1d70ed]" : "text-slate-300"}`}
            />
          )}{" "}
          {step}
        </div>
      ))}
    </div>
  );
}
