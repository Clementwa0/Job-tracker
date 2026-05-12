import React, { useState } from "react";

import { Briefcase } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SectionCard from "./SectionCard";

import type { Job } from "@/types";

interface Props {
  formData: Job;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;
}

const JobInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <SectionCard
      title="Job Information"
      icon={<Briefcase className="w-5 h-5" />}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Job Title</Label>

          <Input
            className="mt-1"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Company</Label>

          <Input
            className="mt-1"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Location</Label>

          <Input
            className="mt-1"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Salary Range</Label>

          <Input
            className="mt-1"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default JobInformationSection;