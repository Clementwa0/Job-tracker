"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";

type Status = "idle" | "loading" | "error";

interface UseGoogleAuthOptions {
  /** "user" for jobseekers, "employer" for employers - selects the account type and dashboard redirect. */
  role: "user" | "employer";
  /** Optional deep-link to return to after sign-in, e.g. from a `redirect` query param. */
  redirectTo?: string | null;
}

const DEFAULT_ERROR = "We couldn't sign you in with Google. Please try again.";

/** UI wrapper (status, error, redirect) around AuthContext's `loginWithGoogle` - the only Google sign-in flow. */
export function useGoogleAuth({ role, redirectTo }: UseGoogleAuthOptions) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (idToken: string) => {
      setStatus("loading");
      setError(null);
      try {
        const user = await loginWithGoogle(idToken, role);
        router.push(resolvePostLoginRedirect(user.role ?? role, redirectTo));
      } catch (err) {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : DEFAULT_ERROR;
        setError(message);
        setStatus("error");
      }
    },
    [loginWithGoogle, role, redirectTo, router],
  );

  return { handleCredential, status, error, isLoading: status === "loading" };
}
