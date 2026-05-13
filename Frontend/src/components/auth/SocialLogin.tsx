import React from "react";

type SocialProvider = {
  name: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
};

export const socialProviders: SocialProvider[] = [
  {
    name: "Google",
    color: "text-red-500",
    glow: "hover:shadow-red-500/40 hover:ring-red-500/30",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M21.8 10.2h-9.6v3.9h5.5c-.2 1.3-.9 2.5-2 3.3v2.7h3.3c1.9-1.7 3-4.3 3-7.3 0-.8-.1-1.7-.2-2.6z" />
        <path d="M12.2 22c2.7 0 5-.9 6.6-2.5l-3.3-2.7c-.9.6-2 .9-3.3.9-2.6 0-4.8-1.7-5.6-4h-3.4v2.8c1.6 3.2 4.9 5.5 9 5.5z" />
        <path d="M6.6 13.7c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.3H3.2C2.4 8.9 2 10.4 2 12s.4 3.1 1.2 4.7l3.4-3z" />
        <path d="M12.2 6.3c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17.2 3.3 14.9 2 12.2 2c-4.1 0-7.4 2.3-9 5.5l3.4 2.8c.8-2.3 3-4 5.6-4z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    color: "text-gray-900",
    glow: "hover:shadow-gray-900/40 hover:ring-gray-900/30",

    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 .9.9-.2 1.8-.3 2.7-.3s1.8.1 2.7.3c2.1-1.2 3-.9 3-.9.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 2.9 0 3.9-2.4 4.7-4.7 5 .4.3.8 1 .8 2v3c0 .3.2.6.7.5 4-1.4 6.9-5.2 6.9-9.7C22 6.6 17.5 2 12 2z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "text-blue-600",
    glow: "hover:shadow-blue-600/40 hover:ring-blue-600/30",

    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
];
