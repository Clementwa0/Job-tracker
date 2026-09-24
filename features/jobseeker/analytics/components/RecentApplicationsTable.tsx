"use client";

import Link from "next/link";
import { ChevronRight, Calendar, Clock, Mail, FileText, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { applicationStatusColors, type ApplicationStatus } from "@/types/job";

type Row = {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationDate: string;
  status: string;
  matchScore: number | null;
  nextStep: { label: string; icon: "calendar" | "clock" | "mail" | "file" };
};

type Props = {
  rows: Row[];
};

const NEXT_STEP_ICONS = {
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
  file: FileText,
};

const formatDate = (d: string) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const RecentApplicationsTable = ({ rows }: Props) => {
  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Recent Applications
          </h2>
        </div>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No applications yet</p>
          <Link
            href="/jobseeker/applications/add"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            Add your first one
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Next Step</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const color =
                applicationStatusColors[row.status as ApplicationStatus] ||
                "bg-muted text-foreground";
              const StepIcon = NEXT_STEP_ICONS[row.nextStep.icon];

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 rounded-md">
                        <AvatarFallback className="rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                          {row.companyName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate font-medium text-foreground">{row.companyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.jobTitle}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(row.applicationDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${color} px-2 py-0.5`}>
                      {row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {typeof row.matchScore === "number" ? `${row.matchScore}%` : "-"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/jobseeker/applications/edit/${row.id}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <StepIcon className="h-3 w-3" />
                      {row.nextStep.label}
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default RecentApplicationsTable;
