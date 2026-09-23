"use client";

import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { EmployerJobPosting } from "@/types/employer";

interface JobRowActionsProps {
  job: EmployerJobPosting;
  onView: (job: EmployerJobPosting) => void;
  compact?: boolean;
}

export default function JobRowActions({ job, onView, compact }: JobRowActionsProps) {
  const router = useRouter();
  const size = compact ? "icon-xs" : "icon-sm";

  return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size={size}
          aria-label="View job"
          title="View"
          onClick={() => onView(job)}
        >
          <Eye />
        </Button>
        <Button
          variant="ghost"
          size={size}
          aria-label="Edit job"
          title="Edit"
          onClick={() => router.push(`/employer/dashboard/jobs?edit=${job.id}`)}
        >
          <Pencil />
        </Button>
      </div>
    
  );
}
