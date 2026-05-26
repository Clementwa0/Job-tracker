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
import CompanyLogo from "./CompanyLogo";

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

const resolveFileUrl = (file?: string | File | null) => {
  if (!file || typeof file !== "string") return null;
  if (file.startsWith("http")) return file;
  const base = import.meta.env.VITE_API_DB_URL?.replace(/\/api\/?$/, "") ?? "";
  return `${base}${file}`;
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-foreground break-words">{value}</dd>
      </div>
    </div>
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
  const resumeUrl = resolveFileUrl(job.resumeFile);
  const coverLetterUrl = resolveFileUrl(job.coverLetterFile);

  const jobInterviews =
    interviews.length > 0 ? interviews : (job.interviews ?? []);

  return (
    <Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-background"
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-indigo-500/10 via-background to-violet-500/10 border-b border-border/60 px-6 pt-6 pb-5">
          <SheetHeader className="text-left space-y-3">
            <div className="flex items-start gap-3">
              <CompanyLogo
                name={job.companyName}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-xl font-semibold leading-tight text-foreground line-clamp-2">
                  {job.jobTitle}
                </SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-1.5 text-sm">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.companyName}
                  {job.location ? ` · ${job.location}` : ""}
                </SheetDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <JobStatusBadge status={job.applicationStatus} />
              {job.jobType && (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                  {job.jobType}
                </span>
              )}
              {job.workMode && (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                  {job.workMode}
                </span>
              )}
            </div>
          </SheetHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 border-b border-border/60">
            <TabsList className="bg-transparent p-0 h-auto gap-1">
              {[
                { v: "overview", l: "Overview" },
                { v: "interviews", l: `Interviews${jobInterviews.length ? ` (${jobInterviews.length})` : ""}` },
                { v: "notes", l: "Notes" },
                { v: "files", l: "Files" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-md px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TabsContent value="overview" className="mt-0">
              <dl className="divide-y divide-border/40">
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={job.location}
                />
                <InfoRow
                  icon={<Wallet className="h-4 w-4" />}
                  label="Salary"
                  value={job.salaryRange}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Applied on"
                  value={formatDate(job.applicationDate)}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Application deadline"
                  value={formatDate(job.applicationDeadline)}
                />
                <InfoRow
                  icon={<Link2 className="h-4 w-4" />}
                  label="Job posting"
                  value={
                    job.jobPostingUrl && (
                      <a
                        href={job.jobPostingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline break-all"
                      >
                        {job.jobPostingUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )
                  }
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Contact"
                  value={
                    (job.contactPerson || job.contactEmail) && (
                      <div className="space-y-0.5">
                        {job.contactPerson && <div>{job.contactPerson}</div>}
                        {job.contactEmail && (
                          <a
                            href={`mailto:${job.contactEmail}`}
                            className="text-primary hover:underline text-xs"
                          >
                            {job.contactEmail}
                          </a>
                        )}
                      </div>
                    )
                  }
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={job.contactPhone}
                />
              </dl>

              {job.jobDescription && (
                <div className="mt-6">
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {job.jobDescription}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interviews" className="mt-0">
              {jobInterviews.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No interviews scheduled yet.
                </div>
              ) : (
                <ol className="relative space-y-3 border-l border-border/60 pl-5">
                  {jobInterviews.map((i) => {
                    const d = i.interviewDate ? new Date(i.interviewDate) : null;
                    return (
                      <li key={i._id} className="relative">
                        <span className="absolute -left-[27px] top-2.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary" />
                        <div className="rounded-lg border border-border/60 bg-card p-3.5 flex items-start gap-3">
                          {d && (
                            <div className="flex flex-col items-center justify-center rounded-md bg-primary/10 text-primary px-2.5 py-1.5 min-w-[3rem]">
                              <span className="text-[10px] font-bold uppercase">
                                {d.toLocaleString(undefined, { month: "short" })}
                              </span>
                              <span className="text-lg font-bold leading-none">
                                {d.getDate()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold capitalize text-foreground">
                              {i.stage} interview
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {d
                                ? d.toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : "No date"}
                              {i.location ? ` · ${i.location}` : ""}
                            </p>
                            <span className="mt-1.5 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {i.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              {job.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {job.notes}
                </p>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
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
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No files attached.
                </div>
              )}
              {job.attachments?.map((a) => (
                <a
                  key={a._id ?? a.url}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/40 transition"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{a.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="border-t border-border/60 px-6 py-3 flex-row gap-2 sm:justify-between bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(job.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit?.(job.id)}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/40 transition"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {fileName && (
          <div className="text-xs text-muted-foreground truncate">
            {fileName}
          </div>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
  );
};

export default JobDetailsDrawer;
