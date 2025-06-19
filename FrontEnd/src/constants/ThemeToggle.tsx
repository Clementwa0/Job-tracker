import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Toggle theme and store preference
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="relative overflow-hidden group"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${!isDark ? 'opacity-10' : ''}`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isDark ? 'opacity-10' : ''}`}
      />
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-400 relative z-10" />
      ) : (
        <Moon className="h-4 w-4 text-purple-600 relative z-10" />
      )}
    </Button>
  );
};

export default ThemeToggle;
