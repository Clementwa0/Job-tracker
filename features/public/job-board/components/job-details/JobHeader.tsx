import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicJobDetail } from "@/types/jobPosting";

export function JobHeader({
  job,
  onCopy,
  copied,
}: {
  job: PublicJobDetail;
  onCopy: () => void;
  copied: boolean;
}) {
  const isClosed = job.isActive === false || job.status === "closed";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">
          {job.company?.name || "Company"}
        </p>
        {job.company?.industry && (
          <span className="text-xs text-muted-foreground">· {job.company.industry}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopy}
            aria-label="Copy job description"
            title="Copy job description"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy JD"}
          </Button>
          {isClosed && <Badge variant="secondary">Closed</Badge>}
        </div>
      </div>
      <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        {job.title}
      </h1>
    </>
  );
}
