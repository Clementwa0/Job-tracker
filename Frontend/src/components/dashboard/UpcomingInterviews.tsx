import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

type Interview = {
  id: string;
  company: string;
  position: string;
  date: Date;
};

type Props = {
  data: Interview[];
};

const UpcomingInterviews: React.FC<Props> = ({ data }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>

      {data.length === 0 ? (
        <p className="text-gray-500">No upcoming interviews.</p>
      ) : (
        data.map((i) => (
          <div
            key={`${i.id}-${i.date}`}
            className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3"
          >
            <Calendar className="text-purple-500" />

            <div className="flex-1">
              <p className="font-medium">{i.position}</p>
              <p className="text-sm text-gray-500">{i.company}</p>
            </div>

            <span className="text-sm text-gray-400">
              {i.date.toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </Card>
  );
};

export default UpcomingInterviews;