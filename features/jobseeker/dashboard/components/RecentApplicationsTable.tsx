"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { applicationStatusColors, type ApplicationStatus } from "@/types/job";

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const statusLabel = (status: string) =>
  status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const RecentApplicationsTable = () => {
  const { jobs } = useJobs();

  const recent = useMemo(
    () =>
      [...jobs]
        .sort(
          (a, b) =>
            new Date(b.applicationDate).getTime() -
            new Date(a.applicationDate).getTime()
        )
        .slice(0, 5),
    [jobs]
  );

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold tracking-tight">
            Recent Applications
          </h2>
        </div>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-xs font-medium text-foreground">No applications yet</p>
          <Link
            href="/jobseeker/applications/add"
            className="mt-1 inline-block text-[11px] font-medium text-primary hover:underline"
          >
            Add your first one
          </Link>
        </div>
      ) : (
        <>
          {/* Table layout - sm and up */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Company
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Applied
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-8 w-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((job) => {
                  const color =
                    applicationStatusColors[job.applicationStatus as ApplicationStatus] ||
                    "bg-muted text-foreground";
                  return (
                    <TableRow key={job.id} className="h-11">
                      <TableCell className="py-2">
                        <Link
                          href={`/jobseeker/applications/edit/${job.id}`}
                          className="flex items-center gap-2"
                        >
                          <Avatar className="h-7 w-7 rounded-md">
                            <AvatarFallback className="rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                              {(job.companyName || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-xs font-medium text-foreground">
                            {job.jobTitle || "Untitled Job"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {job.companyName || "Unknown"}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {formatDate(job.applicationDate)}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`${color} px-1.5 py-0 text-[10px]`}
                        >
                          {statusLabel(job.applicationStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link href={`/jobseeker/applications/edit/${job.id}`}>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Card layout - mobile only, no horizontal scrolling */}
          <ul className="divide-y divide-border sm:hidden">
            {recent.map((job) => {
              const color =
                applicationStatusColors[job.applicationStatus as ApplicationStatus] ||
                "bg-muted text-foreground";
              return (
                <li key={job.id}>
                  <Link
                    href={`/jobseeker/applications/edit/${job.id}`}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <Avatar className="h-9 w-9 shrink-0 rounded-md">
                      <AvatarFallback className="rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                        {(job.companyName || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {job.jobTitle || "Untitled Job"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {job.companyName || "Unknown"} · {formatDate(job.applicationDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${color} shrink-0 px-1.5 py-0 text-[10px]`}
                    >
                      {statusLabel(job.applicationStatus)}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
};

export default RecentApplicationsTable;