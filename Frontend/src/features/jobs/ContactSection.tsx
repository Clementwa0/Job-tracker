import { Mail, Phone, User, Globe, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Job } from "@/types/job";
import { sources } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  formData: Job;
  setFormData: React.Dispatch<React.SetStateAction<Job>>;
}

const ContactSection = ({ formData, setFormData }: Props) => {
  return (
    <div className="space-y-4 p-5 border rounded-xl text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground border-b pb-2">
        <User className="w-4 h-4 text-primary" />
        Contact Information
      </h2>

      <div className="grid gap-4 pt-1">
        {/* Contact Person */}
        <div className="space-y-1.5">
          <Label htmlFor="contactPerson" className="text-sm font-medium">
            Contact Person
          </Label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="contactPerson"
              className="pl-9"
              placeholder="John Doe"
              value={formData.contactPerson || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactPerson: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="contactEmail"
                type="email"
                className="pl-9"
                placeholder="example@company.com"
                value={formData.contactEmail || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="contactPhone"
                type="tel"
                className="pl-9"
                placeholder="+254 012-345-678"
                value={formData.contactPhone || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactPhone: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Job URL */}
        <div className="space-y-1.5">
          <Label htmlFor="jobPostingUrl" className="text-sm font-medium">
            Application / Job URL
          </Label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="jobPostingUrl"
              type="url"
              className="pl-9"
              placeholder="https://company.com/careers/job"
              value={formData.jobPostingUrl || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  jobPostingUrl: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Source */}
        <div className="space-y-1.5">
          <Label htmlFor="source" className="text-sm font-medium">
            Job Source
          </Label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />

            <Select
              value={formData.source || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, source: value }))
              }
            >
              <SelectTrigger id="source" className="pl-9 w-full bg-background">
                <SelectValue placeholder="Select where you found this job" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900">
                {sources.map((source) => (
                  <SelectItem key={source} value={source.toLowerCase()}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
