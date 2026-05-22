import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";

interface FeedbackCategory {
  id: string;
  key: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface FeedbackTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  feedbackCategories: FeedbackCategory[];
  feedbackData: Record<string, any>;
}

export const FeedbackTabs: React.FC<FeedbackTabsProps> = ({
  activeTab,
  setActiveTab,
  feedbackCategories,
  feedbackData,
}) => {
  const renderFeedbackContent = (content: string, icon?: React.ReactNode) => {
    if (!content || !content.trim()) {
      return <p className="text-sm text-muted-foreground italic">No feedback available.</p>;
    }

    const points = content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[•\-*\s]+/, "").trim());

    return (
      <div className="space-y-2">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-3">
            {icon || <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{point}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-muted/50 p-1">
        {feedbackCategories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <span className="flex items-center gap-2">
              {cat.icon}
              {cat.title.split(" ")[0]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {feedbackCategories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={cat.color}>{cat.icon}</span>
                {cat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg ${cat.bgColor}`}>
                {renderFeedbackContent(feedbackData[cat.key] as string, cat.icon)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};