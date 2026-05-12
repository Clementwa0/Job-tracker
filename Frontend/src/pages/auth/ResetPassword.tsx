import React from "react";
import { useParams, Link } from "react-router-dom";
import { useResetPassword } from "@/hooks/useResetPassword";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    handleSubmit,
  } = useResetPassword(token);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center p-6">
            <CheckCircle2 className="h-8 w-8 text-white mx-auto mb-4" />
            <CardTitle className="text-white">
              Password Reset Successful
            </CardTitle>

            <Link to="/login" className="text-white underline mt-4 block">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="mx-auto text-white" />
          <CardTitle className="text-white">Reset Password</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-white">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <Link to="/login" className="text-white text-sm block mt-4">
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;