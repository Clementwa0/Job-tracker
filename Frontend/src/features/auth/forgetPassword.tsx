import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import API from "@/lib/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email address");
    if (!/\S+@\S+\.\S+/.test(email))
      return setError("Please enter a valid email address");

    setLoading(true);
    try {
      const response = await API.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send reset instructions.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-sky-600 opacity-20 z-0"></div>

          <div className="relative z-10 text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Check Your Email
            </CardTitle>
            <p className="text-sm text-white/80 mt-2">
              We've sent password reset instructions to your email.
            </p>

            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mt-4">
              <p className="text-white text-sm">
                If you don’t see the email, check your spam folder or{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-white font-medium underline ml-1"
                >
                  try again
                </button>
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-sky-600 opacity-20 z-0"></div>

        <div className="relative z-10 p-6">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-white/80">
              Enter your email to reset your password
            </p>
          </CardHeader>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg flex items-center text-sm border border-red-500/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-white text-sm font-medium"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/70" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30 focus:border-white/30"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base bg-white text-blue-900 hover:bg-white/90 transition-all shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
