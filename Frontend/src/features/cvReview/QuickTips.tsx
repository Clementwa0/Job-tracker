import { Lightbulb } from "lucide-react";

const QuickTips = () => {
  const tips = [
    "Use action verbs like Led, Built, Managed",
    "Add numbers to show impact (e.g. +30% sales)",
    "Match keywords from job descriptions",
  ];

  return (
    <div className="bg-green-50 p-4 rounded-xl space-y-3">
      <div className="flex items-center gap-2 font-semibold">
        <Lightbulb className="text-green-600" />
        Quick Tips
      </div>

      <ul className="text-sm space-y-2">
        {tips.map((t, i) => (
          <li key={i}>• {t}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuickTips;