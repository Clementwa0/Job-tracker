import React, { useState } from "react";

import { User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SectionCard from "./SectionCard";

import type { Job } from "@/types";

interface Props {
  formData: Job;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const ContactSection: React.FC<Props> = ({
  formData,
  handleChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard
      title="Contact Information"
      icon={<User className="w-5 h-5" />}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Contact Person</Label>

          <Input
            className="mt-1"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Contact Email</Label>

          <Input
            className="mt-1"
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Contact Phone</Label>

          <Input
            className="mt-1"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default ContactSection;