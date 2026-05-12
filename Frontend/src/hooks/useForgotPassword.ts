import { useState } from "react";
import { forgotPassword as forgotPasswordApi } from "@/lib/auth/auth-api";
import { ApiClientError } from "@/lib/api/api-client";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setEmail("");
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPasswordApi(email);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    error,
    loading,
    success,
    handleSubmit,
    resetForm,
  };
}