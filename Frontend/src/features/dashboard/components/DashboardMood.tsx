import { useDashboardSummary } from "@/hooks/useDashboardSummary";

const moodColors = {
  productive: "text-green-600",
  balanced: "text-blue-600",
  slow: "text-gray-500",
  warning: "text-red-500",
};

const DashboardMood = () => {
  const { mood, message, subtitle, nextAction } = useDashboardSummary();

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border mb-4">
      <p className={`text-sm font-medium ${moodColors[mood]}`}>
        {mood.toUpperCase()} MODE
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {message}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {subtitle}
      </p>

      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
         Next Action
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {nextAction}
        </p>
      </div>
    </div>
  );
};

export default DashboardMood;