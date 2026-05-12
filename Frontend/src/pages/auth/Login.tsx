import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import Logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import LoginFeatures from "@/components/auth/LoginForm";
import { loginSchema } from "@/lib/validation/auth.schema";
import type { LoginFormData } from "@/lib/validation/auth.types";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      await authLogin(data.email, data.password);

      toast.success("Welcome Back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Invalid Email or Password");

      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-green-600 to-teal-700 text-white p-12 relative overflow-hidden">
        <div className="relative z-10 my-auto">
          <img src={Logo} alt="JobTrail Logo" className="w-12 h-12 mb-10" />

          <h1 className="text-4xl font-bold mb-6">
            Welcome Back to JobTrail
          </h1>

          <p className="text-white/80 mb-8">
            Your personal job application manager
          </p>

          <LoginFeatures />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email and password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-green-600 font-medium"
                >
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}