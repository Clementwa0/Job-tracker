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

const iconBase =
  "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground";
const inputClass =
  "h-8 rounded-md pl-8 text-[13px] border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/30";
const labelClass = "text-[11px] font-medium text-muted-foreground";

const ContactSection = ({ formData, setFormData }: Props) => {
  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
        <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          <User className="h-3 w-3 text-primary" />
          Contact
        </h2>
      </div>

      <div className="space-y-3 p-3.5">
        <div className="space-y-1">
          <Label htmlFor="contactPerson" className={labelClass}>
            Contact Person
          </Label>
          <div className="relative">
            <User className={iconBase} />
            <Input
              id="contactPerson"
              className={inputClass}
              placeholder="John Doe"
              value={formData.contactPerson || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="contactEmail" className={labelClass}>
            Email
          </Label>
          <div className="relative">
            <Mail className={iconBase} />
            <Input
              id="contactEmail"
              type="email"
              className={inputClass}
              placeholder="example@company.com"
              value={formData.contactEmail || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="contactPhone" className={labelClass}>
            Phone
          </Label>
          <div className="relative">
            <Phone className={iconBase} />
            <Input
              id="contactPhone"
              type="tel"
              className={inputClass}
              placeholder="+254 012-345-678"
              value={formData.contactPhone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="jobPostingUrl" className={labelClass}>
            Job URL
          </Label>
          <div className="relative">
            <Globe className={iconBase} />
            <Input
              id="jobPostingUrl"
              type="url"
              className={inputClass}
              placeholder="https://company.com/..."
              value={formData.jobPostingUrl || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jobPostingUrl: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="source" className={labelClass}>
            Source
          </Label>
          <div className="relative">
            <Tag className={iconBase} />
            <Select
              value={formData.source || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, source: value ?? "" }))
              }
            >
              <SelectTrigger
                id="source"
                className="h-8 w-full rounded-md border-border/60 bg-background pl-8 text-[13px]"
              >
                <SelectValue placeholder="Where found" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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
