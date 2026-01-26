// ResetPassword.tsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_DB_URL;

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) return setError("All fields are required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else setError(res.data.message || "Failed to reset password");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-sky-600 opacity-20 z-0"></div>
        <div className="relative z-10 text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Password Reset Successful</CardTitle>
          <p className="text-white/80 mt-2 text-sm">Your password has been updated. Redirecting to login...</p>
          <div className="mt-6">
            <Link to="/login" className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-sky-600 opacity-20 z-0"></div>
        <div className="relative z-10 p-6">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
            <p className="text-sm text-white/80">Enter your new password below</p>
          </CardHeader>

          {error && <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg text-sm border border-red-500/30">{error}</div>}

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Label htmlFor="password" className="text-white text-sm font-medium">New Password</Label>
              <Input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter new password" className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30 focus:border-white/30" />

              <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">Confirm Password</Label>
              <Input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm new password" className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30 focus:border-white/30" />

              <Button type="submit" disabled={loading} className="w-full py-3 bg-white text-blue-900 hover:bg-white/90 transition-all shadow-md">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
