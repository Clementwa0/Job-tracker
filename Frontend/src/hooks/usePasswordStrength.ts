import { useEffect, useState } from "react";

export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);
  }, [password]);

  return strength;
}