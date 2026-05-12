import { Briefcase, MapPin, Link as LinkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/ui/formfield";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  jobTypeOptions,
  sourceOptions,
  statusOptions,
} from "@/constants";
import type { JobApplication } from "@/types";


interface Props {
  formData: JobApplication;
  handleInputChange: (field: keyof JobApplication, value: string) => void;
}

const JobDetailsCard = ({ formData, handleInputChange }: Props) => {
  return (
    <Card className="shadow-sm sm:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          label="Job Title"
          value={formData.jobTitle}
          onChange={(e) =>
            handleInputChange("jobTitle", e.target.value)
          }
          required
        />

        <FormField
          label="Company Name"
          value={formData.companyName}
          onChange={(e) =>
            handleInputChange("companyName", e.target.value)
          }
          required
        />

        <FormField
          label="Location"
          value={formData.location}
          onChange={(e) =>
            handleInputChange("location", e.target.value)
          }
          icon={MapPin}
        />

        <div>
          <Label>Job Type</Label>

          <Select
            value={formData.jobType}
            onValueChange={(value) =>
              handleInputChange("jobType", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>

            <SelectContent>
              {jobTypeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <FormField
          label="Application Date"
          type="date"
          value={formData.applicationDate}
          onChange={(e) =>
            handleInputChange("applicationDate", e.target.value)
          }
        />

        <FormField
          label="Application Deadline"
          type="date"
          value={formData.applicationDeadline}
          onChange={(e) =>
            handleInputChange(
              "applicationDeadline",
              e.target.value
            )
          }
        />

        <Separator />

        <div>
          <Label>Source</Label>

          <Select
            value={formData.source}
            onValueChange={(value) =>
              handleInputChange("source", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {sourceOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>

          <Select
            value={formData.applicationStatus}
            onValueChange={(value) =>
              handleInputChange("applicationStatus", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          label="Job Posting URL"
          value={formData.jobPostingUrl}
          onChange={(e) =>
            handleInputChange("jobPostingUrl", e.target.value)
          }
          icon={LinkIcon}
        />
      </CardContent>
    </Card>
  );
};

export default JobDetailsCard;