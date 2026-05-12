import React from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle2, XCircle } from "lucide-react";

type Activity = {
  id: string;
  type: "offer" | "rejection" | "interview" | "application";
  company: string;
  position: string;
  date: Date;
};

type Props = {
  data: Activity[];
};

const RecentApplications: React.FC<Props> = ({ data }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

      {data.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        data.map((a) => (
          <div
            key={a.id}
            className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3"
          >
            <div>
              {a.type === "offer" && <CheckCircle2 />}
              {a.type === "rejection" && <XCircle />}
              {a.type === "interview" && <Calendar />}
              {a.type === "application" && <Briefcase />}
            </div>

            <div className="flex-1">
              <p className="font-medium">{a.position}</p>
              <p className="text-sm text-gray-500">{a.company}</p>
            </div>

            <span className="text-sm text-gray-400">
              {a.date.toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </Card>
  );
};

export default RecentApplications;