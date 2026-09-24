"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { roleStorage } from "@/lib/auth/roleStorage";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";
import type { AuthResponse } from "@/types/auth";

type Status = "idle" | "loading" | "error";

interface UseGoogleAuthOptions {
  /** Calls the backend with the Google ID token and returns the auth response. */
  signIn: (idToken: string) => Promise<AuthResponse>;
  /** "user" for jobseekers, "employer" for employers - used for the dashboard redirect and local role cache. */
  role: "user" | "employer";
  /** Optional deep-link to return to after sign-in, e.g. from a `redirect` query param. */
  redirectTo?: string | null;
}

const DEFAULT_ERROR = "We couldn't sign you in with Google. Please try again.";

export function useGoogleAuth({ signIn, role, redirectTo }: UseGoogleAuthOptions) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (idToken: string) => {
      setStatus("loading");
      setError(null);
      try {
        const response = await signIn(idToken);
        setSession(response.data.user, response.data.token);
        roleStorage.set(role);
        router.push(resolvePostLoginRedirect(response.data.user.role ?? role, redirectTo));
      } catch (err) {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : DEFAULT_ERROR;
        setError(message);
        setStatus("error");
      }
    },
    [signIn, role, redirectTo, router, setSession],
  );

  return { handleCredential, status, error, isLoading: status === "loading" };
}
