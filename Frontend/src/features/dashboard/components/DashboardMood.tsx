import { useDashboardSummary } from "@/hooks/useDashboardSummary";

const moodColors: Record<string, string> = {
  productive: "text-green-600 dark:text-green-400",
  balanced: "text-blue-600 dark:text-blue-400",
  slow: "text-gray-500 dark:text-gray-400",
  warning: "text-red-500 dark:text-red-400",
};

const DashboardMood = () => {
  const { mood, message, subtitle, nextAction } = useDashboardSummary();

  const safeMood = mood ?? "balanced";

  return (
    <div
      className="p-4 rounded-xl
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      shadow-sm transition-colors"
    >
      <p className={`text-sm font-medium ${moodColors[safeMood]}`}>
        {safeMood.toUpperCase()} MODE
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {message}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {subtitle}
      </p>

      <div
        className="mt-4 p-3 rounded-lg
        bg-gray-50 dark:bg-gray-800
        border border-gray-100 dark:border-gray-700"
      >
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