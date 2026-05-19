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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
  errors?: Record<string, string>
}

const JobDetailsSection = ({ formData, setFormData,errors = {} }: Props) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formData.applicationDate
      ? new Date(formData.applicationDate)
      : undefined,
    to: formData.applicationDeadline
      ? new Date(formData.applicationDeadline)
      : undefined,
  });

  // Safe SSR layout initialization for dual-pane calendar views
  const [monthsToShow, setMonthsToShow] = useState<number>(2);

  useEffect(() => {
    const handleResize = () => {
      setMonthsToShow(window.innerWidth < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStatusChange = (value: ApplicationStatus) => {
    setFormData((prev) => ({
      ...prev,
      applicationStatus: value,
    }));
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    setFormData((prev) => ({
      ...prev,
      applicationDate: range?.from ? range.from.toISOString() : "",
      applicationDeadline: range?.to ? range.to.toISOString() : "",
    }));
  };

  return (
    <div className="space-y-4 p-5 border rounded-xl text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground border-b pb-2">
        <Briefcase className="w-4 h-4 text-primary" />
        Job Details
      </h2>

      {/* Main Container Grid: Handles 1 col on mobile, 2 cols on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        
        {/* Job Title */}
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle" className="text-sm font-medium">
            Job Title *
          </Label>
          <div className="relative">
            <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="jobTitle"
              className={errors.jobTitle ? "border-destructive pl-9" : ""}
              value={formData.jobTitle || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
              placeholder="e.g. Full Stack Developer"
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-sm font-medium">
            Company Name
          </Label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="companyName"
              className={errors.companyName ? "border-destructive" : ""}
              value={formData.companyName || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              placeholder="e.g. Safaricom"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="location"
              className="pl-9"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Remote, Nairobi, etc."
            />
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-1.5">
          <Label htmlFor="salaryRange" className="text-sm font-medium">
            Salary Range
          </Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="salaryRange"
              className="pl-9"
              value={formData.salaryRange || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salaryRange: e.target.value,
                }))
              }
              placeholder="e.g. Kshs 80k - Kshs 110k"
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-1.5">
          <Label htmlFor="jobType" className="text-sm font-medium">
            Job Type
          </Label>
          <div className="relative">
            <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={formData.jobType || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, jobType: value }))
              }
            >
              <SelectTrigger
                id="jobType"
                className="pl-9 w-full "
              >
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent className="bg-sky-800">
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Application Status */}
        <div className="space-y-1.5">
          <Label htmlFor="applicationStatus" className="text-sm font-medium">
            Application Status
          </Label>
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={formData.applicationStatus || "applied"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger
                id="applicationStatus"
                className="pl-9 w-full bg-background"
              >
                <SelectValue placeholder="Applied" />
              </SelectTrigger>
              <SelectContent className="bg-sky-900">
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Application Period Timeline - Takes up full width on desktop for visual balance */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-sm font-medium">Application Timeline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9 px-3 text-sm border-input",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span className="text-foreground">
                      {format(dateRange.from, "LLL dd, yyyy")} &rarr;{" "}
                      {format(dateRange.to, "LLL dd, yyyy")}
                    </span>
                  ) : (
                    <span className="text-foreground">
                      {format(dateRange.from, "LLL dd, yyyy")}
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground">
                    Set application & deadline dates
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={monthsToShow}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSection;