import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CVFeedback } from "@/types/resume.types";

interface Props {
  feedback: CVFeedback;
}

const FeedbackTabs = ({ feedback }: Props) => {
  const items: { key: keyof CVFeedback; label: string }[] = [
    { key: "formatting_and_structure", label: "Formatting" },
    { key: "grammar_and_clarity", label: "Grammar" },
    { key: "skills_match", label: "Skills" },
    { key: "achievements_and_impact", label: "Impact" },
    { key: "ats_compatibility", label: "ATS" },
  ];

  return (
    <Tabs defaultValue="formatting_and_structure">
      <TabsList className="grid grid-cols-2 md:grid-cols-5">
        {items.map((i) => (
          <TabsTrigger key={i.key} value={i.key}>
            {i.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((i) => (
        <TabsContent key={i.key} value={i.key}>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm whitespace-pre-line">
              {feedback?.[i.key]}
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default FeedbackTabs;