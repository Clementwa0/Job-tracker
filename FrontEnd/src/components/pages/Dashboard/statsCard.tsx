export const Stat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "amber" | "purple" | "green" | "red";
}) => {
  const colorStyles: Record<typeof color, {
    text: string;
    bg: string;
    valueText: string;
    darkText: string;
    darkBg: string;
  }> = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-100",
      valueText: "text-blue-700",
      darkText: "dark:text-blue-300",
      darkBg: "dark:bg-blue-950",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-100",
      valueText: "text-amber-700",
      darkText: "dark:text-amber-300",
      darkBg: "dark:bg-amber-950",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-100",
      valueText: "text-purple-700",
      darkText: "dark:text-purple-300",
      darkBg: "dark:bg-purple-950",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-100",
      valueText: "text-green-700",
      darkText: "dark:text-green-300",
      darkBg: "dark:bg-green-950",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-100",
      valueText: "text-red-700",
      darkText: "dark:text-red-300",
      darkBg: "dark:bg-red-950",
    },
  };

  const styles = colorStyles[color];

  return (
    <div className="flex items-start lg:items-center gap-3">
      <div className={`hidden sm:block p-1 rounded-lg ${styles.bg} ${styles.darkBg}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-medium ${styles.text} ${styles.darkText}`}>
          {label}
        </p>
        <p
          className={`text-2xl font-bold ${styles.valueText} ${styles.darkText}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
