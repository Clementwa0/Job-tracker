import { useState, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { socialProviders } from "./SocialLogin";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

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
      toast.error("Invalid Email or Password", {
        description: "Check your credentials",
      });

      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-6  relative overflow-hidden">
      {/* Animated background shapes */}
      {/* <div className="absolute top-0 left-0 w-72 h-72 bg-green-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-40 left-40 w-72 h-72 bg-teal-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none animate-pulse delay-2000"></div> */}

      <div
        ref={formRef}
        className="w-full max-w-sm  backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-xl 
          hover:shadow-2xl transition-shadow duration-300 relative z-10"
      >
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Login to access your job applications
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium">Login Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}
          <div className="flex justify-center gap-4">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                type="button"
                aria-label={`Continue with ${provider.name}`}
                className={`
        relative flex items-center justify-center h-12 w-12 rounded-xl 
        border border-gray-200 bg-white shadow-sm
        transition-all duration-300
        hover:scale-110 hover:border-transparent
        hover:ring-2 hover:ring-offset-2
        ${provider.glow}
      `}
              >
                <span className={`text-2xl ${provider.color}`}>
                  {provider.icon}
                </span>
              </button>
            ))}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold text-gray-700"
            >
              Email Address
            </Label>
            <Input
              type="email"
              {...register("email")}
              autoComplete="email"
              placeholder="Enter your email"
              className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                }
                focus:ring-2 focus:ring-offset-1`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-gray-700"
              >
                Password
              </Label>
              <Link
                to="/forgetPassword"
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 pr-10
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  }
                  focus:ring-2 focus:ring-offset-1`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-700 to-teal-600 
              text-white shadow-md hover:shadow-xl hover:from-green-800 hover:to-teal-700 
              transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600 pt-2">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-green-600 hover:text-green-700 transition-colors hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
