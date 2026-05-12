import React from "react";
import { Card } from "@/components/ui/card";

type Props = {
  title?: string;
  children?: React.ReactNode;
};

const ActivityChart: React.FC<Props> = ({
  title = "Activity Overview",
  children,
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="h-[250px] flex items-center justify-center text-gray-400">
        {children || "Chart goes here"}
      </div>
    </Card>
  );
};

export default ActivityChart;