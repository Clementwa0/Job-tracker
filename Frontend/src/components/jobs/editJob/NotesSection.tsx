import React, { useState } from "react";

import { Briefcase } from "lucide-react";

import { Label } from "@/components/ui/label";

import SectionCard from "./SectionCard";

import type { Job } from "@/types";

interface Props {
  formData: Job;
  handleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
}

const NotesSection: React.FC<Props> = ({
  formData,
  handleChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard
      title="Notes"
      icon={<Briefcase className="w-5 h-5" />}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <div>
        <Label>Additional Notes</Label>

        <textarea
          rows={5}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border rounded-md p-3 mt-1 bg-background"
        />
      </div>
    </SectionCard>
  );
};

export default NotesSection;