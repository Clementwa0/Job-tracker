
function getEnvVar(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (value === undefined || value === "") {
    if (import.meta.env.DEV) {
      console.warn(`[ENV] Missing or empty: ${key}`);
      return key === "VITE_API_DB_URL" ? "http://localhost:5000/api" : "";
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: getEnvVar("VITE_API_DB_URL"),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
