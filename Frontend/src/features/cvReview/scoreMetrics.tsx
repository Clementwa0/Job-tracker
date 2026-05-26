import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";

import React from "react";

export interface ScoreMetrics {
  color: string;
  label: string;
  badgeClass: string;
  progressClass: string;
  icon: React.ReactNode;
}

export const getScoreMetrics = (
  score: number
): ScoreMetrics => {
  if (score >= 90) {
    return {
      color: "text-green-600",
      label: "Excellent",
      badgeClass:
        "bg-green-100 text-green-700 border-green-200",
      progressClass: "[&>div]:bg-green-600",
      icon: <Star className="h-4 w-4" />,
    };
  }

  if (score >= 80) {
    return {
      color: "text-blue-600",
      label: "Strong",
      badgeClass:
        "bg-blue-100 text-blue-700 border-blue-200",
      progressClass: "[&>div]:bg-blue-600",
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  }

  if (score >= 70) {
    return {
      color: "text-yellow-600",
      label: "Average",
      badgeClass:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      progressClass: "[&>div]:bg-yellow-500",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }

  return {
    color: "text-red-600",
    label: "Weak",
    badgeClass:
      "bg-red-100 text-red-700 border-red-200",
    progressClass: "[&>div]:bg-red-600",
    icon: <AlertCircle className="h-4 w-4" />,
  };
};