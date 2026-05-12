import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/formfield";
import type { Interview } from "@/types";

interface Props {
  interviews: Interview[];
  addInterview: () => void;
  removeInterview: (index: number) => void;
  updateInterview: (
    index: number,
    field: keyof Interview,
    value: string
  ) => void;
}

const InterviewSection = ({
  interviews,
  addInterview,
  removeInterview,
  updateInterview,
}: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Interview Schedule</h4>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInterview}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Interview
        </Button>
      </div>

      {interviews.map((interview, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <h5>Interview {index + 1}</h5>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInterview(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              label="Interview Date"
              type="date"
              value={interview.date}
              onChange={(e) =>
                updateInterview(index, "date", e.target.value)
              }
            />

            <FormField
              label="Interview Type"
              value={interview.type}
              onChange={(e) =>
                updateInterview(index, "type", e.target.value)
              }
            />

            <FormField
              label="Notes"
              value={interview.notes}
              onChange={(e) =>
                updateInterview(index, "notes", e.target.value)
              }
              textarea
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewSection;