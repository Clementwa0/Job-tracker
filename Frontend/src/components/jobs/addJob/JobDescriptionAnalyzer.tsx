import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/formfield";

interface Props {
  pastedDescription: string;
  setPastedDescription: (value: string) => void;
  analyzeDescription: () => void;
  isAnalyzing: boolean;
}

const JobDescriptionAnalyzer = ({
  pastedDescription,
  setPastedDescription,
  analyzeDescription,
  isAnalyzing,
}: Props) => {
  return (
    <Card className="shadow-sm sm:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Analyze Job Description
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          label="Paste Job Description"
          value={pastedDescription}
          onChange={(e) => setPastedDescription(e.target.value)}
          textarea
        />

        <Button
          onClick={analyzeDescription}
          disabled={isAnalyzing || !pastedDescription}
        >
          {isAnalyzing ? "Analyzing..." : "Auto-Fill"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobDescriptionAnalyzer;