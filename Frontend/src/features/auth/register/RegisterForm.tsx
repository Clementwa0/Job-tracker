import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { usePasswordStrength } from "./usePasswordStrength";
import { useRegisterAnimation } from "./useRegisterAnimation";
import { registerSchema, type RegisterFormData } from "@/lib/validation";


export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  
  const formRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");
  const {
    getStrengthColor,
    getStrengthText,
    getStrengthTextColor,
    getStrengthPercentage,
  } = usePasswordStrength(passwordValue);

  // Initialize animations
  useRegisterAnimation(isLoading, !error && !isLoading);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authRegister(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
      
      <div
        ref={formRef}
        className="w-full max-w-sm bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-xl 
          hover:shadow-2xl transition-shadow duration-300 relative z-10"
      >
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Join thousands managing their job search
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium">Registration Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
              Full Name
            </Label>
            <Input
              type="text"
              {...register("name")}
              autoComplete="name"
              placeholder="Enter your full name"
              className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200
                ${errors.name 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                }
                focus:ring-2 focus:ring-offset-1`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
              Email Address
            </Label>
            <Input
              type="email"
              {...register("email")}
              autoComplete="email"
              placeholder="Enter your email"
              className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200
                ${errors.email 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
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
            <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                autoComplete="new-password"
                placeholder="Create a password"
                className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 pr-10
                  ${errors.password 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                  }
                  focus:ring-2 focus:ring-offset-1`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordValue && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`}
                    style={{ width: `${getStrengthPercentage()}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 pr-10
                  ${errors.confirmPassword 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                  }
                  focus:ring-2 focus:ring-offset-1`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-teal-600 to-sky-600 
              text-white shadow-md hover:shadow-xl hover:from-teal-700 hover:to-sky-700 
              transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-600 hover:text-sky-700 transition-colors hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

