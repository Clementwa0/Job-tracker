import { MapPin, BriefcaseBusiness } from "lucide-react";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PreviewBadge() {
  return (
    <Badge variant="outline" className="absolute right-2 top-2 h-4 border-border bg-card/90 px-1.5 text-[9px] font-medium text-muted-foreground">
      Preview
    </Badge>
  );
}

export default function Benefit({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      <span className="min-w-0">
        <b className="block text-[13px] font-medium text-foreground">{title}</b>
        <small className="block text-[12px] text-muted-foreground">{sub}</small>
      </span>
    </div>
  );
}

export function JobCard() {
  return (
    <div className="absolute bottom-0 left-[43%] hidden w-[220px] rounded-lg border border-border bg-card p-3 text-card-foreground shadow-[0_6px_16px_rgba(23,40,80,.1)] xl:block">
      <PreviewBadge />
      <div className="flex gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[15px] font-semibold text-primary">A</span>
        <div className="min-w-0">
          <b className="block truncate text-[13px] text-foreground">Product Manager</b>
          <small className="block truncate text-muted-foreground">Aurora Labs</small>
        </div>
      </div>
      <div className="mt-2.5 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Los Gatos, CA</span>
        <span className="flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3" />Full-time</span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Product</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Strategy</span>
      </div>
    </div>
  );
}