import React, { useState } from "react";

import { Calendar } from "lucide-react";

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

const DatesSection: React.FC<Props> = ({
  formData,
  handleChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard
      title="Dates"
      icon={<Calendar className="w-5 h-5" />}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Application Date</Label>

          <Input
            className="mt-1"
            type="date"
            name="applicationDate"
            value={formData.applicationDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Application Deadline</Label>

          <Input
            className="mt-1"
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default DatesSection;