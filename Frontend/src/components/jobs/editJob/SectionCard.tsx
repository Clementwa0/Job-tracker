import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SectionCard: React.FC<Props> = ({
  title,
  icon,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="flex items-center font-semibold">
          {icon}
          <span className="ml-2">{title}</span>
        </h2>

        {expanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {expanded && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default SectionCard;