import { MapPin, BriefcaseBusiness } from "lucide-react";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PreviewBadge() {
  return (
    <Badge
      variant="outline"
      className="absolute right-2 top-2 h-4 border-slate-200 bg-white/90 px-1.5 text-[9px] font-medium text-slate-400"
    >
      Preview
    </Badge>
  );
}

export default function Benefit({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4ff] text-[#1b70ed] [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      <span>
        <b className="block font-medium text-[#172036]">{title}</b>
        <small>{sub}</small>
      </span>
    </div>
  );
}

export function JobCard() {
  return (
    <div className="absolute bottom-0 left-[43%] w-[220px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_6px_16px_rgba(23,40,80,.1)]">
      <PreviewBadge />
      <div className="flex gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[15px] font-semibold text-[#1b70ed]">
          A
        </span>
        <div>
          <b className="block text-[13px] text-[#131b2c]">Product Manager</b>
          <small className="text-[#697386]">Aurora Labs</small>
        </div>
      </div>
      <div className="mt-2.5 flex gap-3 text-[10px] text-[#70798a]">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Los Gatos, CA
        </span>
        <span className="flex items-center gap-1">
          <BriefcaseBusiness className="h-3 w-3" />
          Full-time
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
          Product
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
          Strategy
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
          +2
        </span>
      </div>
    </div>
  );
}
