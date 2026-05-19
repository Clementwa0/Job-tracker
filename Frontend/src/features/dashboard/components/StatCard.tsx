import React from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "amber" | "purple" | "green" | "red";
};

const colors = {
  blue: "text-blue-600",
  amber: "text-amber-600",
  purple: "text-purple-600",
  green: "text-green-600",
  red: "text-red-600",
};

const StatCard = ({ icon, label, value, color }: Props) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className={colors[color]}>{icon}</div>

      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;