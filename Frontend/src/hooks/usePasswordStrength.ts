import { useEffect, useState } from "react";

export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    
    // Uppercase letter check
    if (/[A-Z]/.test(password)) score++;
    
    // Number check
    if (/[0-9]/.test(password)) score++;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    const colors = {
      0: "bg-gray-200",
      1: "bg-red-500",
      2: "bg-orange-500",
      3: "bg-yellow-500",
      4: "bg-green-500",
    };
    return colors[strength as keyof typeof colors];
  };

  const getStrengthText = () => {
    const texts = {
      1: "Weak",
      2: "Fair",
      3: "Good",
      4: "Strong",
    };
    return texts[strength as keyof typeof texts] || "";
  };

  const getStrengthTextColor = () => {
    const colors = {
      1: "text-red-500",
      2: "text-orange-500",
      3: "text-yellow-600",
      4: "text-green-500",
    };
    return colors[strength as keyof typeof colors] || "";
  };

  const getStrengthPercentage = () => {
    return (strength / 4) * 100;
  };

  return {
    strength,
    getStrengthColor,
    getStrengthText,
    getStrengthTextColor,
    getStrengthPercentage,
  };
}