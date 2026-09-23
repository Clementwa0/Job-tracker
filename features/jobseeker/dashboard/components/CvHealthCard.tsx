"use client";

import Link from "next/link";
import { ChevronRight, FileCheck2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useResumesIndex } from "@/features/jobseeker/resumes/hooks/useResumes";

const CvHealthCard = () => {
  const { items: resumes, loading } = useResumesIndex();
  const hasResume = resumes.length > 0;

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold tracking-tight">Quick CV Health</h2>
        </div>
        <Link
          href="/jobseeker/cv-review"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="h-20 animate-pulse rounded-lg bg-muted/40" />
      ) : hasResume ? (
        <>
          <p className="text-xs text-muted-foreground">
            You have {resumes.length} resume{resumes.length === 1 ? "" : "s"} on file. Run an ATS
            check to see how well it matches roles you&apos;re applying to.
          </p>
          <Link
            href="/jobseeker/cv-review"
            className="mt-3 flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Check ATS Score
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            You haven&apos;t added a resume yet. Build one to unlock ATS scoring and job matching.
          </p>
          <Link
            href="/jobseeker/resumes"
            className="mt-3 flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Build Your CV
          </Link>
        </>
      )}
    </Card>
  );
};

export default CvHealthCard;
