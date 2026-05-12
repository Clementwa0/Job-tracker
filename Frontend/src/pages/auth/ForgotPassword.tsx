import React from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "@/hooks/useForgotPassword";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const {
    email,
    setEmail,
    loading,
    error,
    success,
    handleSubmit,
    resetForm,
  } = useForgotPassword();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardTitle className="text-white text-center">
            Check Your Email
          </CardTitle>

          <CheckCircle2 className="mx-auto text-white mt-4" />

          <p className="text-white text-center mt-3">
            Reset link sent successfully
          </p>

          <button
            onClick={resetForm}
            className="text-white underline block mx-auto mt-4"
          >
            Try again
          </button>

          <Link to="/login" className="text-white block text-center mt-4">
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Mail className="mx-auto text-white" />
          <CardTitle className="text-white">Forgot Password</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <Link to="/login" className="text-white block mt-4 text-center">
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;