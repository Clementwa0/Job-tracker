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

const JobDetailsSection = ({ formData, setFormData, errors = {} }: Props) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formData.applicationDate
      ? new Date(formData.applicationDate)
      : undefined,
    to: formData.applicationDeadline
      ? new Date(formData.applicationDeadline)
      : undefined,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleStatusChange = (value: ApplicationStatus) => {
    setFormData((prev) => ({ ...prev, applicationStatus: value }));
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFormData((prev) => ({
      ...prev,
      applicationDate: range?.from ? range.from.toISOString() : "",
      applicationDeadline: range?.to ? range.to.toISOString() : "",
    }));

    // Close calendar when both dates are selected
    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
    }
  };

  const fieldWrapper = "space-y-1.5";
  const iconBase =
    "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground";
  const inputBase =
    "pl-9 h-10 rounded-xl border-muted focus-visible:ring-2 focus-visible:ring-primary/30 transition";

  const errorText = (key: string) =>
    errors[key] ? (
      <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
    ) : null;

  const isRequired = (field: string) =>
    [
      "jobTitle",
      "companyName",
      "location",
      "jobType",
      "applicationDate",
    ].includes(field);

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b pb-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Job Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title - Required */}
        <div className={fieldWrapper}>
          <Label htmlFor="jobTitle">
            Job Title{" "}
            {isRequired("jobTitle") && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Briefcase className={iconBase} />
            <Input
              id="jobTitle"
              value={formData.jobTitle || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, jobTitle: e.target.value }))
              }
              placeholder="Full Stack Developer"
              className={cn(
                inputBase,
                errors.jobTitle && "border-red-500 focus-visible:ring-red-500",
              )}
            />
          </div>
          {errorText("jobTitle")}
        </div>

        {/* Company Name - Required */}
        <div className={fieldWrapper}>
          <Label>
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
                setFormData((p) => ({ ...p, companyName: e.target.value }))
              }
              placeholder="Safaricom"
              className={cn(
                inputBase,
                errors.companyName &&
                  "border-red-500 focus-visible:ring-red-500",
              )}
            />
          </div>
          {errorText("companyName")}
        </div>

        {/* Location - Required */}
        <div className={fieldWrapper}>
          <Label>
            Location{" "}
            {isRequired("location") && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <MapPin className={iconBase} />
            <Input
              value={formData.location || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="Remote, Nairobi"
              className={cn(
                inputBase,
                errors.location && "border-red-500 focus-visible:ring-red-500",
              )}
            />
          </div>
          {errorText("location")}
        </div>

        {/* Salary Range - Optional */}
        <div className={fieldWrapper}>
          <Label>Salary Range</Label>
          <div className="relative">
            <DollarSign className={iconBase} />
            <Input
              value={formData.salaryRange || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, salaryRange: e.target.value }))
              }
              placeholder="Ksh 80k - 120k"
              className={cn(inputBase, errors.salaryRange && "border-red-500")}
            />
          </div>
          {errorText("salaryRange")}
        </div>

        {/* Job Type - Required */}
        <div className={fieldWrapper}>
          <Label>
            Job Type{" "}
            {isRequired("jobType") && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Layers className={iconBase} />
            <Select
              value={formData.jobType || ""}
              onValueChange={(v) => setFormData((p) => ({ ...p, jobType: v }))}
            >
              <SelectTrigger
                className={cn(
                  "pl-9 h-10 rounded-xl",
                  errors.jobType && "border-red-500 focus-visible:ring-red-500",
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

        {/* Status - Optional */}
        <div className={fieldWrapper}>
          <Label>Status</Label>
          <div className="relative">
            <CheckCircle2 className={iconBase} />
            <Select
              value={formData.applicationStatus || "applied"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger
                className={cn(
                  "pl-9 h-10 rounded-xl",
                  errors.applicationStatus && "border-red-500",
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

        {/* Application Timeline - Required with 2 months always visible */}
        <div className="md:col-span-2 space-y-1.5">
          <Label>
            Application Timeline <span className="text-red-500">*</span>
          </Label>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start h-10 rounded-xl font-normal",
                  errors.applicationDate &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
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
                    Select application period (start → deadline)
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-auto" align="start" sideOffset={5}>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
                className="rounded-xl pointer-events-auto flex flex-col"
                classNames={{
                  months: "flex flex-row space-x-4",
                  month: "w-auto h-auto",
                }}
                modifiers={{
                  disabled: { before: new Date() }, // Optional: disable past dates
                }}
               
              />
              <div className="p-3 border-t flex justify-between text-xs text-muted-foreground">
                <span>Click start date → end date</span>
              </div>
            </PopoverContent>
          </Popover>

          {errorText("applicationDate")}
          {!errors.applicationDate && dateRange?.from && !dateRange?.to && (
            <p className="text-xs text-blue-600 mt-1">
              ✓ Start date selected. Now select the deadline date.
            </p>
          )}
          {!errors.applicationDate && !dateRange?.from && (
            <p className="text-xs text-muted-foreground">
              Select application start date and deadline
            </p>
          )}
          {!errors.applicationDate && dateRange?.from && dateRange?.to && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Application period selected: {format(dateRange.from, "MMM dd")}{" "}
              → {format(dateRange.to, "MMM dd, yyyy")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSection;
