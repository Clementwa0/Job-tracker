import React from "react";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  isLoading: boolean;
  onCancel: () => void;
}

const JobActions: React.FC<Props> = ({
  isLoading,
  onCancel,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <Button
        type="submit"
        disabled={isLoading}
        className="hover:bg-sky-700 transition-colors"
      >
        <Save className="w-4 h-4 mr-2" />

        {isLoading ? "Saving..." : "Save Changes"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default JobActions;