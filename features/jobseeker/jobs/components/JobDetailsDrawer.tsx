import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  Wallet,
  Link2,
  FileText,
  Mail,
  Phone,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { Job } from "@/types/job";
import type { Interview } from "@/types";
import JobStatusBadge from "./JobStatusBadge";
import PriorityBadge from "./PriorityBadge";
import CompanyLogo from "./CompanyLogo";
import ActivityTimeline from "./ActivityTimeline";
import { resolveApiAssetUrl } from "@/lib/storage/upload.client";

interface Props {
  job: Job | null;
  interviews?: Interview[];
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const formatDate = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-[13px] text-foreground">{value}</dd>
      </div>
    </div>
  );
};

const stageLabel = (stage: string) =>
  stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const InterviewStageGroups: React.FC<{ interviews: Interview[] }> = ({ interviews }) => {
  const grouped = interviews.reduce<Record<string, Interview[]>>((acc, iv) => {
    const key = iv.stage || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(iv);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([stage, items]) => (
        <div key={stage}>
          <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {stageLabel(stage)}
          </h4>
          <ol className="relative space-y-2.5 border-l border-border/60 pl-4">
            {items.map((i) => {
              const d = i.interviewDate ? new Date(i.interviewDate) : null;
              return (
                <li key={i._id} className="relative">
                  <span className="absolute -left-[22px] top-2.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary" />
                  <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card p-3">
                    {d && (
                      <div className="flex min-w-[2.5rem] flex-col items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <span className="text-[9px] font-bold uppercase">
                          {d.toLocaleString(undefined, { month: "short" })}
                        </span>
                        <span className="text-base font-bold leading-none">
                          {d.getDate()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {d
                          ? d.toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "No date"}
                        {i.location ? ` · ${i.location}` : ""}
                      </p>
                      <span className="mt-1 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        {i.status}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
};

const FileLink: React.FC<{
  label: string;
  url: string | null;
  fileName?: string;
}> = ({ label, url, fileName }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card p-2.5 transition hover:bg-muted/40"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <FileText className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-foreground">{label}</div>
        {fileName && (
          <div className="truncate text-[10.5px] text-muted-foreground">
            {fileName}
          </div>
        )}
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
    </a>
  );
};

const JobDetailsDrawer: React.FC<Props> = ({
  job,
  interviews = [],
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!job) return null;
  const resumeUrl = resolveApiAssetUrl(
    typeof job.resumeFile === "string" ? job.resumeFile : null,
  );
  const coverLetterUrl = resolveApiAssetUrl(
    typeof job.coverLetterFile === "string" ? job.coverLetterFile : null,
  );

  const jobInterviews = interviews.length > 0 ? interviews : (job.interviews ?? []);

  return (
    <Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-background p-0 sm:max-w-lg"
      >
        <div className="relative border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-amber-500/10 px-5 pt-5 pb-4">
          <SheetHeader className="space-y-2.5 text-left">
            <div className="flex items-start gap-2.5">
              <CompanyLogo name={job.companyName} size="lg" />
              <div className="min-w-0 flex-1">
                <SheetTitle className="line-clamp-2 font-display text-lg font-semibold leading-tight text-foreground">
                  {job.jobTitle}
                </SheetTitle>
                <SheetDescription className="mt-0.5 flex items-center gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  {job.companyName}
                  {job.location ? ` · ${job.location}` : ""}
                </SheetDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <JobStatusBadge status={job.applicationStatus} />
              {job.priority && <PriorityBadge priority={job.priority} />}
              {job.jobType && (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10.5px] text-muted-foreground">
                  {job.jobType}
                </span>
              )}
              {job.workMode && (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10.5px] capitalize text-muted-foreground">
                  {job.workMode}
                </span>
              )}
            </div>
          </SheetHeader>
        </div>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border/60 px-5 pt-3">
            <TabsList className="h-auto gap-0.5 bg-transparent p-0">
              {[
                { v: "overview", l: "Overview" },
                {
                  v: "interviews",
                  l: `Interviews${jobInterviews.length ? ` (${jobInterviews.length})` : ""}`,
                },
                {
                  v: "activity",
                  l: `Activity${job.activity?.length ? ` (${job.activity.length})` : ""}`,
                },
                { v: "notes", l: "Notes" },
                { v: "files", l: "Files" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <TabsContent value="overview" className="mt-0">
              <dl className="divide-y divide-border/40">
                <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={job.location} />
                <InfoRow icon={<Wallet className="h-3.5 w-3.5" />} label="Salary" value={job.salaryRange} />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Applied on" value={formatDate(job.applicationDate)} />
                <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Deadline" value={formatDate(job.applicationDeadline)} />
                <InfoRow
                  icon={<Link2 className="h-3.5 w-3.5" />}
                  label="Job posting"
                  value={
                    job.jobPostingUrl && (
                      <a
                        href={job.jobPostingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                      >
                        {job.jobPostingUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )
                  }
                />
                <InfoRow
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Contact"
                  value={
                    (job.contactPerson || job.contactEmail) && (
                      <div className="space-y-0.5">
                        {job.contactPerson && <div>{job.contactPerson}</div>}
                        {job.contactEmail && (
                          <a
                            href={`mailto:${job.contactEmail}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {job.contactEmail}
                          </a>
                        )}
                      </div>
                    )
                  }
                />
                <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={job.contactPhone} />
              </dl>

              {job.jobDescription && (
                <div className="mt-5">
                  <h4 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </h4>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
                    {job.jobDescription}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interviews" className="mt-0">
              {jobInterviews.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No interviews scheduled yet.
                </div>
              ) : (
                <InterviewStageGroups interviews={jobInterviews} />
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityTimeline activities={job.activity ?? []} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              {job.notes ? (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
                  {job.notes}
                </p>
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No notes added.
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="mt-0 space-y-2">
              <FileLink
                label="Resume"
                url={resumeUrl}
                fileName={
                  typeof job.resumeFile === "string"
                    ? job.resumeFile.split("/").pop()
                    : job.resumeFile?.name
                }
              />
              <FileLink
                label="Cover letter"
                url={coverLetterUrl}
                fileName={
                  typeof job.coverLetterFile === "string"
                    ? job.coverLetterFile.split("/").pop()
                    : undefined
                }
              />
              {!resumeUrl && !coverLetterUrl && (job.attachments?.length ?? 0) === 0 && (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No files attached.
                </div>
              )}
              {job.attachments?.map((a) => (
                <a
                  key={a._id ?? a.url}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card p-2.5 transition hover:bg-muted/40"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 truncate text-[12.5px]">{a.name}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="flex-row gap-2 border-t border-border/60 bg-background px-5 py-3 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(job.id)}
            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit?.(job.id)}
              className="h-8 gap-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JobDetailsDrawer;