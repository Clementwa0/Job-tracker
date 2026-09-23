"use client";

import {
  Briefcase,
  CalendarIcon,
  Building2,
  MapPin,
  DollarSign,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Job, ApplicationStatus } from "@/types/job";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { jobTypes, statuses } from "@/constants";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
  errors?: Record<string, string>;
}

const JobDetailsSection = ({
  formData,
  setFormData,
  errors = {},
}: Props) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formData.applicationDate
      ? new Date(formData.applicationDate)
      : undefined,
    to: formData.applicationDeadline
      ? new Date(formData.applicationDeadline)
      : undefined,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  /**
   * Select components return string | null.
   * We need to narrow the value before assigning it
   * to the stricter ApplicationStatus type.
   */
  const handleStatusChange = (value: string | null) => {
    if (value === null) return;

    setFormData((prev) => ({
      ...prev,
      applicationStatus: value as ApplicationStatus,
    }));
  };

  /**
   * Job type has a stricter type in Job than the generic
   * string returned by Select.
   */
  const handleJobTypeChange = (value: string | null) => {
    if (value === null) return;

    setFormData((prev) => ({
      ...prev,
      jobType: value as Job["jobType"],
    }));
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    setFormData((prev) => ({
      ...prev,
      applicationDate: range?.from ? range.from.toISOString() : "",
      applicationDeadline: range?.to ? range.to.toISOString() : "",
    }));

    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
    }
  };

  const fieldWrapper = "space-y-1.5";

  const iconBase =
    "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground";

  const inputBase =
    "h-9 rounded-lg pl-8 text-[13px] border-border focus-visible:ring-2 focus-visible:ring-primary/30 transition";

  const errorText = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-[10.5px] text-red-500">{errors[key]}</p>
    ) : null;

  const isRequired = (field: string) =>
    ["jobTitle", "companyName", "location", "jobType", "applicationDate"].includes(
      field
    );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
        </div>

        <h2 className="text-sm font-semibold">Job Details</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Job Title */}
        <div className={fieldWrapper}>
          <Label htmlFor="jobTitle" className="text-xs">
            Job Title{" "}
            {isRequired("jobTitle") && (
              <span className="text-red-500">*</span>
            )}
          </Label>

          <div className="relative">
            <Briefcase className={iconBase} />

            <Input
              id="jobTitle"
              value={formData.jobTitle || ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  jobTitle: e.target.value,
                }))
              }
              placeholder="Full Stack Developer"
              className={cn(
                inputBase,
                errors.jobTitle &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>

          {errorText("jobTitle")}
        </div>

        {/* Company Name */}
        <div className={fieldWrapper}>
          <Label className="text-xs">
            Company Name{" "}
            {isRequired("companyName") && (
              <span className="text-red-500">*</span>
            )}
          </Label>

          <div className="relative">
            <Building2 className={iconBase} />

            <Input
              value={formData.companyName || ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  companyName: e.target.value,
                }))
              }
              placeholder="Safaricom"
              className={cn(
                inputBase,
                errors.companyName &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>

          {errorText("companyName")}
        </div>

        {/* Location */}
        <div className={fieldWrapper}>
          <Label className="text-xs">
            Location{" "}
            {isRequired("location") && (
              <span className="text-red-500">*</span>
            )}
          </Label>

          <div className="relative">
            <MapPin className={iconBase} />

            <Input
              value={formData.location || ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  location: e.target.value,
                }))
              }
              placeholder="Remote, Nairobi"
              className={cn(
                inputBase,
                errors.location &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>

          {errorText("location")}
        </div>

        {/* Salary */}
        <div className={fieldWrapper}>
          <Label className="text-xs">Salary Range</Label>

          <div className="relative">
            <DollarSign className={iconBase} />

            <Input
              value={formData.salaryRange || ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  salaryRange: e.target.value,
                }))
              }
              placeholder="Ksh 80k - 120k"
              className={cn(
                inputBase,
                errors.salaryRange && "border-red-500"
              )}
            />
          </div>

          {errorText("salaryRange")}
        </div>

        {/* Job Type */}
        <div className={fieldWrapper}>
          <Label className="text-xs">
            Job Type{" "}
            {isRequired("jobType") && (
              <span className="text-red-500">*</span>
            )}
          </Label>

          <div className="relative">
            <Layers className={iconBase} />

            <Select
              value={formData.jobType || ""}
              onValueChange={handleJobTypeChange}
            >
              <SelectTrigger
                className={cn(
                  "h-9 rounded-lg pl-8 text-[13px]",
                  errors.jobType &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                {jobTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorText("jobType")}
        </div>

        {/* Status */}
        <div className={fieldWrapper}>
          <Label className="text-xs">Status</Label>

          <div className="relative">
            <CheckCircle2 className={iconBase} />

            <Select
              value={formData.applicationStatus || "applied"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger
                className={cn(
                  "h-9 rounded-lg pl-8 text-[13px]",
                  errors.applicationStatus && "border-red-500"
                )}
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorText("applicationStatus")}
        </div>

        {/* Timeline */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">
            Application Timeline{" "}
            <span className="text-red-500">*</span>
          </Label>

          <Popover
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
          >
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-start rounded-lg text-[13px] font-normal",
                    errors.applicationDate &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />

              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} →{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                <span className="text-muted-foreground">
                  Select application period
                </span>
              )}
            </PopoverTrigger>

            <PopoverContent
              className="w-auto p-0"
              align="start"
              sideOffset={5}
            >
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
                className="pointer-events-auto flex flex-col rounded-xl"
                classNames={{
                  months: "flex flex-row space-x-4",
                  month: "w-auto h-auto",
                }}
              />

              <div className="border-t p-2.5 text-[10.5px] text-muted-foreground">
                Click start date → end date
              </div>
            </PopoverContent>
          </Popover>

          {errorText("applicationDate")}

          {!errors.applicationDate &&
            dateRange?.from &&
            !dateRange?.to && (
              <p className="mt-1 text-[10.5px] text-blue-600">
                ✓ Start date selected. Now select the deadline.
              </p>
            )}

          {!errors.applicationDate && !dateRange?.from && (
            <p className="text-[10.5px] text-muted-foreground">
              Select application start date and deadline
            </p>
          )}

          {!errors.applicationDate &&
            dateRange?.from &&
            dateRange?.to && (
              <p className="mt-1 text-[10.5px] text-green-600">
                ✓ {format(dateRange.from, "MMM dd")} →{" "}
                {format(dateRange.to, "MMM dd, yyyy")}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSection;