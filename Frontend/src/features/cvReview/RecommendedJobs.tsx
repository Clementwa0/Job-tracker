import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface Props {
  jobs: string;
}

const RecommendedJobs = ({ jobs }: Props) => {
  const list = jobs?.split("\n").filter(Boolean) || [];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.slice(0, 6).map((job, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex gap-3">
            <Briefcase className="text-blue-500" />
            <p className="font-medium">{job}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendedJobs;