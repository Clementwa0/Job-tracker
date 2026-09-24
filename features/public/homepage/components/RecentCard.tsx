import { ChevronRight } from "lucide-react";
import { PreviewBadge } from "./Jobcard";

export default function RecentCard() {
  return (
    <div className="absolute bottom-20 right-[1%] hidden w-[200px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_6px_16px_rgba(23,40,80,.1)] xl:block">
      <PreviewBadge />
      <div className="flex justify-between pr-12 text-[10px]">
        <b>Recent application</b>
        <span className="text-[#697386]">2h ago</span>
      </div>
      <div className="mt-3 flex gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f4f0ff] text-[14px] font-semibold text-[#7a3dda]">L</span>
        <div className="min-w-0">
          <b className="block truncate text-[13px]">UX Designer</b>
          <small className="block truncate text-[#697386]">Lumen Studios</small>
        </div>
      </div>
      <div className="mt-2.5 rounded bg-[#faf4ff] px-2 py-0.5 text-[10px] text-[#7a3dda]">Interview scheduled</div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-slate-200 py-1.5 text-[11px] text-[#131b2c]">
        View details <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}