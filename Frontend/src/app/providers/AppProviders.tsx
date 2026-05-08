import { type PropsWithChildren } from "react";
import { ThemeProvider } from "@/constants/theme-provider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { QueryProvider } from "@/app/providers/QueryProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

