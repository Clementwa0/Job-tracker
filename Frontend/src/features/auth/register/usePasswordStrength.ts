import { useMemo } from "react";

export const usePasswordStrength = (password: string) => {
  return useMemo(() => {
    const value = password || "";

    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const percentage = (score / 4) * 100;

    const getStrengthText = () => {
      if (score <= 1) return "Weak";
      if (score === 2) return "Fair";
      if (score === 3) return "Good";
      return "Strong";
    };

    const getStrengthColor = () => {
      if (score <= 1) return "bg-red-500";
      if (score === 2) return "bg-yellow-500";
      if (score === 3) return "bg-blue-500";
      return "bg-green-500";
    };

    const getStrengthTextColor = () => {
      if (score <= 1) return "text-red-500";
      if (score === 2) return "text-yellow-500";
      if (score === 3) return "text-blue-500";
      return "text-green-500";
    };

    const getStrengthPercentage = () => percentage;

    return {
      getStrengthColor,
      getStrengthText,
      getStrengthTextColor,
      getStrengthPercentage,
    };
  }, [password]);
};