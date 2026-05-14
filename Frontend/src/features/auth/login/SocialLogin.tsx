import React from "react";

type SocialProvider = {
  name: "Google" | "GitHub" | "Facebook";
  icon: React.ReactNode;
  color: string;
  glow: string;
};

/* -----------------------------
   ICONS (INLINE)
------------------------------ */

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.9 2.34 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l8.1 6.3C12.5 13.1 17.8 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-3.1-.42-4.5H24v9h12.7c-.6 3.1-2.4 5.7-5 7.5l7.8 6.1C43.8 38.2 46.5 31.9 46.5 24.5z" />
    <path fill="#FBBC05" d="M10.6 28.6c-1-3.1-1-6.4 0-9.5l-8.1-6.3C.8 16.5 0 20.1 0 24c0 3.9.8 7.5 2.5 11.2l8.1-6.6z" />
    <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.8-6.1c-2.2 1.5-5 2.4-7.7 2.4-6.2 0-11.5-3.6-13.4-8.9l-8.1 6.6C6.4 42.6 14.6 48 24 48z" />
  </svg>
);

const GitHubIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 .9.9-.2 1.8-.3 2.7-.3s1.8.1 2.7.3c2.1-1.2 3-.9 3-.9.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 2.9 0 3.9-2.4 4.7-4.7 5 .4.3.8 1 .8 2v3c0 .3.2.6.7.5C19.1 20.5 22 16.7 22 12.2 22 6.6 17.5 2 12 2z" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
  </svg>
);

/* -----------------------------
   PROVIDERS
------------------------------ */

export const socialProviders: SocialProvider[] = [
  {
    name: "Google",
    icon: <GoogleIcon />,
    color: "text-red-600",
    glow: "hover:shadow-red-500/40 hover:ring-red-500/30",
  },
  {
    name: "GitHub",
    icon: <GitHubIcon />,
    color: "text-gray-900",
    glow: "hover:shadow-gray-900/40 hover:ring-gray-900/30",
  },
  {
    name: "Facebook",
    icon: <FacebookIcon />,
    color: "text-blue-600",
    glow: "hover:shadow-blue-600/40 hover:ring-blue-600/30",
  },
];