import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

// Deterministic pastel gradient per company name
const palette = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

const CompanyLogo: React.FC<Props> = ({ name, logo, size = "md", className }) => {
  const initials = (name || "?")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const idx =
    Math.abs(
      Array.from(name || "?").reduce((a, c) => a + c.charCodeAt(0), 0),
    ) % palette.length;

  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className={cn(
          "rounded-lg object-cover ring-1 ring-border/60 bg-white",
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
        "flex shrink-0 items-center justify-center rounded-lg font-semibold text-white bg-gradient-to-br shadow-sm",
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
