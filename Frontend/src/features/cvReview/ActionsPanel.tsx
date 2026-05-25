import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Lightbulb, FileText } from "lucide-react";

interface ActionsPanelProps {
  copied: boolean;
  onCopy: () => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ copied, onCopy }) => {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onCopy} className="w-full gap-2">
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Feedback
            </>
          )}
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <Lightbulb className="h-4 w-4" />
          Save Report
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </Button>
      </CardContent>
    </Card>
  );
};