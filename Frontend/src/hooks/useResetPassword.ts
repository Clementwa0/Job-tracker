import { useState } from "react";
import { resetPassword as resetPasswordApi } from "@/lib/auth/auth-api";
import { ApiClientError } from "@/lib/api/api-client";

export function useResetPassword(token?: string) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordApi(token, password);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    handleSubmit,
  };
}