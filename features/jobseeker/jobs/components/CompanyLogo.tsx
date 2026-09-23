import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const palette = [
  "from-primary to-primary/70",
  "from-amber-500 to-amber-600",
  "from-primary/80 to-amber-500/60",
  "from-amber-500/80 to-primary/60",
  "from-primary to-amber-500",
];

const CompanyLogo: React.FC<Props> = ({ name, logo, size = "md", className }) => {
  const initials = (name || "?")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const idx =
    Math.abs(Array.from(name || "?").reduce((a, c) => a + c.charCodeAt(0), 0)) %
    palette.length;

  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className={cn(
          "shrink-0 rounded-lg bg-white object-cover ring-1 ring-border/60",
          sizeMap[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-semibold text-white shadow-sm",
        palette[idx],
        sizeMap[size],
        className,
      )}
    >
      {initials}
    </div>
  );
};

export default CompanyLogo;